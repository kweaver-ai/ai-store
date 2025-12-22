"""
应用路由

应用管理端点的 FastAPI 路由。
这是处理 HTTP 请求并委托给应用层的接口适配器。
"""
import io
import logging
from fastapi import APIRouter, HTTPException, status, Query, Request
from fastapi.responses import Response
from typing import List

from src.application.application_service import ApplicationService
from src.routers.schemas.application import (
    ApplicationResponse,
    ApplicationBasicInfoResponse,
    MicroAppResponse,
    OntologyListResponse,
    OntologyInfoResponse,
    AgentListResponse,
    AgentInfoResponse,
    OntologyConfigItemResponse,
    AgentConfigItemResponse,
    ErrorResponse,
)

logger = logging.getLogger(__name__)


def create_application_router(application_service: ApplicationService) -> APIRouter:
    """
    创建应用路由。

    参数:
        application_service: 应用服务实例

    返回:
        APIRouter: 配置完成的路由
    """
    router = APIRouter(tags=["Application"])

    def _micro_app_to_response(micro_app) -> MicroAppResponse:
        """将微应用领域模型转换为响应模型。"""
        if micro_app is None:
            return None
        return MicroAppResponse(
            name=micro_app.name,
            entry=micro_app.entry,
            headless=micro_app.headless,
        )

    def _application_to_response(app) -> ApplicationResponse:
        """将应用领域模型转换为响应模型。"""
        return ApplicationResponse(
            key=app.key,
            name=app.name,
            description=app.description,
            icon=app.icon,
            category=app.category,
            version=app.version,
            micro_app=_micro_app_to_response(app.micro_app),
            release_config=app.release_config or [],
            ontology_config=[
                OntologyConfigItemResponse(id=item.id, is_config=item.is_config)
                for item in (app.ontology_config or [])
            ],
            agent_config=[
                AgentConfigItemResponse(id=item.id, is_config=item.is_config)
                for item in (app.agent_config or [])
            ],
            is_config=app.is_config,
            updated_by=app.updated_by,
            updated_at=app.updated_at,
        )

    # ============ 1、安装应用 ============
    @router.post(
        "/applications",
        summary="安装应用",
        description="上传 zip 格式安装包进行安装（流式上传）",
        response_model=ApplicationResponse,
        responses={
            200: {"description": "安装成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            409: {"description": "版本冲突", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def install_application(request: Request) -> ApplicationResponse:
        """
        安装应用。

        接收 zip 格式安装包（流式上传），解析并安装应用。

        流程：
        1. 上传 zip 格式安装包（流式上传）
        2. 校验应用安装包结构和 manifest.yaml
        3. 解析 application.key，校验 version
        4. 如果应用已存在，版本号必须大于已上传版本
        5. 解压安装包，上传镜像和 Chart
        6. 导入业务知识网络和 DataAgent 智能体
        7. 更新应用信息

        返回:
            ApplicationResponse: 安装后的应用信息
        """
        try:
            # 读取请求体（流式上传的 zip 数据）
            body = await request.body()
            
            if not body:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "code": "INVALID_REQUEST",
                        "description": "请求体不能为空",
                    }
                )
            
            # 获取更新者用户 ID（从请求头或认证信息中获取）
            updated_by = request.headers.get("X-User-Id", "system")
            
            # 调用服务安装应用
            zip_data = io.BytesIO(body)
            application = await application_service.install_application(
                zip_data=zip_data,
                updated_by=updated_by,
            )
            
            return _application_to_response(application)
        
        except HTTPException:
            # 重新抛出 HTTPException，不再包装
            raise
        except ValueError as e:
            error_msg = str(e)
            if "版本" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "code": "VERSION_CONFLICT",
                        "description": error_msg,
                    }
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "INVALID_PACKAGE",
                    "description": error_msg,
                }
            )
        except Exception as e:
            logger.exception(f"安装应用失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"安装应用失败: {str(e)}",
                }
            )

    # ============ 2、获取应用列表 ============
    @router.get(
        "/applications",
        summary="获取已安装应用列表",
        response_model=List[ApplicationResponse],
        responses={
            200: {"description": "成功获取应用列表"},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
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
            return [_application_to_response(app) for app in applications]

        except Exception as e:
            logger.exception(f"获取应用列表失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"获取应用列表失败: {str(e)}",
                }
            )

    # ============ 3、应用配置 ============
    @router.put(
        "/applications/config",
        summary="配置应用",
        description="配置应用的业务知识网络和智能体（基于数据库中已有配置，将配置项标记为已配置）。",
        response_model=ApplicationResponse,
        responses={
            200: {"description": "配置成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            404: {"description": "应用不存在", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def configure_application(
        request: Request,
        key: str = Query(..., description="应用唯一标识", max_length=32),
    ) -> ApplicationResponse:
        """
        配置应用。

        配置应用的业务知识网络和智能体。

        参数:
            key: 应用唯一标识
            config_request: 配置请求体

        返回:
            ApplicationResponse: 更新后的应用信息
        """
        try:
            # 获取更新者用户 ID
            updated_by = request.headers.get("X-User-Id", "system")

            # 应用配置不再从请求体中传入，而是直接基于数据库中已有的配置，
            # 将业务知识网络配置和智能体配置的 is_config 统一设置为 True。
            application = await application_service.configure_application(
                app_id=key,
                updated_by=updated_by,
            )
            
            return _application_to_response(application)
        
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "description": str(e),
                }
            )
        except Exception as e:
            logger.exception(f"配置应用失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"配置应用失败: {str(e)}",
                }
            )

    # ============ 4.1、查看基础信息 ============
    @router.get(
        "/applications/basic-info",
        summary="查看应用基础信息",
        description="查看应用的基本信息，包括名称、描述、版本、是否配置视图",
        response_model=ApplicationBasicInfoResponse,
        responses={
            200: {"description": "获取基础信息成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            404: {"description": "应用不存在", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def get_application_basic_info(
        key: str = Query(..., description="应用唯一标识", max_length=32),
    ) -> ApplicationBasicInfoResponse:
        """
        查看应用基础信息。

        参数:
            key: 应用唯一标识

        返回:
            ApplicationBasicInfoResponse: 应用基础信息
        """
        try:
            application = await application_service.get_application_basic_info(key)
            
            return ApplicationBasicInfoResponse(
                key=application.key,
                name=application.name,
                description=application.description,
                version=application.version,
                icon=application.icon,
                category=application.category,
                micro_app=_micro_app_to_response(application.micro_app),
                is_config=application.is_config,
                updated_by=application.updated_by,
                updated_at=application.updated_at,
            )
        
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "description": str(e),
                }
            )
        except Exception as e:
            logger.exception(f"获取应用基础信息失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"获取应用基础信息失败: {str(e)}",
                }
            )

    # ============ 4.2、查看业务知识网络配置 ============
    @router.get(
        "/applications/ontologies",
        summary="查看业务知识网络配置",
        description="查看应用的业务知识网络配置情况",
        response_model=OntologyListResponse,
        responses={
            200: {"description": "获取业务知识网络配置成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            404: {"description": "应用不存在", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def get_application_ontologies(
        key: str = Query(..., description="应用唯一标识", max_length=32),
    ) -> OntologyListResponse:
        """
        查看业务知识网络配置。

        流程：
        1. 查询应用的业务知识网络 IDs
        2. 遍历查询业务知识网络详情获取名称、描述

        参数:
            key: 应用唯一标识

        返回:
            OntologyListResponse: 业务知识网络列表
        """
        try:
            ontologies = await application_service.get_application_ontologies(key)
            
            return OntologyListResponse(
                ontologies=[
                    OntologyInfoResponse(
                        id=onto.id,
                        name=onto.name,
                        description=onto.description,
                    )
                    for onto in ontologies
                ]
            )
        
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "description": str(e),
                }
            )
        except Exception as e:
            logger.exception(f"获取业务知识网络配置失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"获取业务知识网络配置失败: {str(e)}",
                }
            )

    # ============ 4.3、查看智能体配置 ============
    @router.get(
        "/applications/agents",
        summary="查看智能体配置",
        description="查看应用的 Data Agent 智能体配置情况",
        response_model=AgentListResponse,
        responses={
            200: {"description": "获取智能体配置成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            404: {"description": "应用不存在", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def get_application_agents(
        key: str = Query(..., description="应用唯一标识", max_length=32),
    ) -> AgentListResponse:
        """
        查看智能体配置。

        流程：
        1. 查询应用的 Data Agent 智能体 IDs
        2. 查询 Data Agent 智能体详情

        参数:
            key: 应用唯一标识

        返回:
            AgentListResponse: 智能体列表
        """
        try:
            agents = await application_service.get_application_agents(key)
            
            return AgentListResponse(
                agents=[
                    AgentInfoResponse(
                        id=agent.id,
                        name=agent.name,
                        description=agent.description,
                    )
                    for agent in agents
                ]
            )
        
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "description": str(e),
                }
            )
        except Exception as e:
            logger.exception(f"获取智能体配置失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"获取智能体配置失败: {str(e)}",
                }
            )

    # ============ 5、卸载应用 ============
    @router.delete(
        "/applications/{key}",
        summary="卸载应用",
        description="卸载指定的应用",
        status_code=status.HTTP_204_NO_CONTENT,
        responses={
            204: {"description": "卸载应用成功"},
            400: {"description": "请求参数错误", "model": ErrorResponse},
            404: {"description": "应用不存在", "model": ErrorResponse},
            500: {"description": "服务器内部错误", "model": ErrorResponse},
        }
    )
    async def uninstall_application(key: str) -> Response:
        """
        卸载应用。

        流程：
        1. 调用卸载应用接口（删除 helm release）
        2. 删除数据库中应用记录

        参数:
            key: 应用唯一标识

        返回:
            None: 成功时返回 204 No Content
        """
        try:
            await application_service.uninstall_application(key)
            return Response(status_code=status.HTTP_204_NO_CONTENT)

        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "description": str(e),
                }
            )
        except Exception as e:
            logger.exception(f"卸载应用失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "code": "INTERNAL_ERROR",
                    "description": f"卸载应用失败: {str(e)}",
                }
            )

    return router
