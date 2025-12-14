"""
应用路由

应用管理端点的 FastAPI 路由。
这是处理 HTTP 请求并委托给应用层的接口适配器。
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from src.application.application_service import ApplicationService
from src.routers.schemas.application import ApplicationResponse


def create_application_router(application_service: ApplicationService) -> APIRouter:
    """
    创建应用路由。

    参数:
        application_service: 应用服务实例

    返回:
        APIRouter: 配置完成的路由
    """
    router = APIRouter(tags=["Application"])

    @router.get(
        "/applications",
        summary="获取已安装应用列表",
        response_model=List[ApplicationResponse],
        responses={
            200: {"description": "成功获取应用列表"},
            500: {"description": "服务器内部错误"},
        }
    )
    async def get_applications() -> List[ApplicationResponse]:
        """
        获取已安装应用列表。

        返回所有已安装的应用信息，按更新时间倒序排列。

        返回:
            List[ApplicationResponse]: 应用列表
        """
        try:
            applications = await application_service.get_all_applications()

            # 转换为响应模型
            application_responses = [
                ApplicationResponse(
                    key=app.key,
                    name=app.name,
                    description=app.description,
                    version=app.version,
                    icon=app.icon,
                    category=app.category,
                    updated_by=app.updated_by,
                    updated_at=app.updated_at,
                )
                for app in applications
            ]

            return application_responses

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"获取应用列表失败: {str(e)}"
            )

    @router.get(
        "/applications/{key}",
        summary="获取指定应用信息",
        response_model=ApplicationResponse,
        responses={
            200: {"description": "成功获取应用信息"},
            404: {"description": "应用不存在"},
            500: {"description": "服务器内部错误"},
        }
    )
    async def get_application(key: str) -> ApplicationResponse:
        """
        根据应用唯一标识获取应用信息。

        参数:
            key: 应用包唯一标识

        返回:
            ApplicationResponse: 应用信息

        异常:
            HTTPException: 当应用不存在时返回 404
        """
        try:
            application = await application_service.get_application_by_key(key)

            return ApplicationResponse(
                key=application.key,
                name=application.name,
                description=application.description,
                version=application.version,
                icon=application.icon,
                category=application.category,
                updated_by=application.updated_by,
                updated_at=application.updated_at,
            )

        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"获取应用信息失败: {str(e)}"
            )

    @router.delete(
        "/applications/{key}",
        summary="卸载应用",
        status_code=status.HTTP_204_NO_CONTENT,
        responses={
            204: {"description": "卸载应用成功"},
            404: {"description": "应用不存在"},
            500: {"description": "服务器内部错误"},
        }
    )
    async def delete_application(key: str):
        """
        卸载应用。

        根据应用唯一标识删除应用，包括删除数据库中的应用记录。

        参数:
            key: 应用包唯一标识

        异常:
            HTTPException: 当应用不存在时返回 404
        """
        try:
            await application_service.delete_application(key)
            return None

        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"删除应用失败: {str(e)}"
            )

    return router
