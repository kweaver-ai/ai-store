"""
DIP Hub 应用程序入口

这是 FastAPI 应用程序的主入口点。
负责组装依赖（注入适配器实现）并启动 Web 服务。
"""
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# 将项目根目录添加到 Python 路径，以便模块导入
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.config.settings import get_settings, Settings
from src.infrastructure.container import init_container, get_container
from src.infrastructure.logging.logger import setup_logging
from src.infrastructure.middleware.auth_middleware import AuthMiddleware
from src.routers.health_router import create_health_router
from src.routers.application_router import create_application_router


def create_app(settings: Settings = None) -> FastAPI:
    """
    创建并配置 FastAPI 应用程序。
    
    参数:
        settings: 应用配置。如果为 None，则使用默认配置。
    
    返回:
        FastAPI: 配置完成的应用实例。
    """
    if settings is None:
        settings = get_settings()
    
    # 设置日志
    logger = setup_logging(settings)
    
    # 初始化依赖注入容器
    container = init_container(settings)
    
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """应用生命周期管理器。"""
        logger.info(f"启动 {settings.app_name} v{settings.app_version}")
        logger.info(f"服务运行在 {settings.host}:{settings.port}")

        # 初始化完成后标记服务为就绪状态
        container.set_ready(True)
        logger.info("服务已准备好接受请求")

        yield

        # 关闭时清理资源
        logger.info("正在关闭服务")
        container.set_ready(False)

        # 关闭数据库连接池
        await container.close()
        logger.info("资源已释放")
    
    # 创建 FastAPI 应用
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
        docs_url=f"{settings.api_prefix}/docs",
        redoc_url=f"{settings.api_prefix}/redoc",
        openapi_url=f"{settings.api_prefix}/openapi.json",
    )
    
    # 添加认证中间件（最先添加，确保token在请求处理前被提取）
    app.add_middleware(AuthMiddleware)
    
    # 添加 CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    health_router = create_health_router(container.health_service)
    app.include_router(health_router, prefix=settings.api_prefix)

    application_router = create_application_router(container.application_service)
    app.include_router(application_router, prefix=settings.api_prefix)

    return app


# 创建应用实例
app = create_app()


def main():
    """使用 uvicorn 运行应用程序。"""
    settings = get_settings()
    
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=settings.workers if not settings.debug else 1,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
