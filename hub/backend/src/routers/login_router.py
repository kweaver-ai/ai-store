"""
登录路由

登录端点的 FastAPI 路由。
这是处理 HTTP 请求并委托给应用层的接口适配器。
"""
import logging
from urllib.parse import urlencode, quote
from fastapi import APIRouter, Query, Request, Response, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.responses import Response as StarletteResponse

from src.application.login_service import LoginService
from src.domains.session import SessionInfo
from src.infrastructure.config.settings import Settings, get_settings

logger = logging.getLogger(__name__)


def create_login_router(login_service: LoginService, settings: Settings = None) -> APIRouter:
    """
    创建登录路由。

    参数:
        login_service: 登录服务实例
        settings: 应用配置

    返回:
        APIRouter: 配置完成的路由
    """
    if settings is None:
        settings = get_settings()
    
    router = APIRouter(tags=["Login"])

    def _get_frontend_path(path: str = "") -> str:
        """获取前端路径，处理路径拼接"""
        base = settings.frontend_base_path.rstrip("/")
        if path:
            path = path.lstrip("/")
            return f"{base}/{path}" if base else f"/{path}"
        return base if base else "/"

    def _get_cookie_value(request: Request, name: str) -> str | None:
        """获取 Cookie 值"""
        return request.cookies.get(name)

    def _set_cookie(
        response: Response,
        name: str,
        value: str,
        max_age: int = 3600,
        domain: str = "",
        path: str = "/",
        secure: bool = True,
        httponly: bool = False,
        samesite: str = "None",
    ):
        """设置 Cookie"""
        cookie_value = quote(value, safe="")
        response.set_cookie(
            key=name,
            value=cookie_value,
            max_age=max_age,
            domain=domain if domain else None,
            path=path,
            secure=secure,
            httponly=httponly,
            samesite=samesite,
        )

    @router.get(
        "/login",
        summary="登录接口",
        description="登录接口，重定向到请求授权接口",
        response_class=HTMLResponse,
    )
    async def login(
        request: Request,
        asredirect: str | None = Query(default=None, description="AnyShare 重定向地址"),
    ):
        """
        登录接口。

        流程：
        1. 检查是否有有效的 token cookie
        2. 生成 state 和 nonce
        3. 创建或获取 session
        4. 保存 session 信息
        5. 重定向到 OAuth2 授权端点
        """
        try:
            # 检查是否有有效的 token
            token = _get_cookie_value(request, "dip.oauth2_token")
            if token:
                token_effect = await login_service.check_token_effect(token)
                if token_effect:
                    # Token 有效，直接返回成功页面或重定向
                    if asredirect:
                        return RedirectResponse(url=asredirect, status_code=status.HTTP_302_FOUND)
                    else:
                        frontend_path = _get_frontend_path("login-success")
                        return HTMLResponse(
                            content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                            status_code=status.HTTP_200_OK,
                        )

            # 生成 state 和 nonce
            state = login_service.generate_state()
            nonce = login_service.generate_nonce()

            # 获取或创建 session
            existing_session_id = _get_cookie_value(request, "dip.session_id")
            session_id, session_info = await login_service.get_or_create_session(
                existing_session_id,
                state,
                asredirect,
            )
            if existing_session_id and session_info.state != state:
                state = session_info.state

            # 获取主机 URL
            base_url = await login_service.get_host_url()

            # 构建 OAuth2 授权 URL
            redirect_uri = f"{base_url}/api/dip-hub/v1/login/callback"
            auth_params = {
                "redirect_uri": redirect_uri,
                "client_id": settings.oauth_client_id,
                "scope": "openid offline all",
                "response_type": "code",
                "state": state,
                "nonce": nonce,
            }
            auth_url = f"{base_url}/oauth2/auth?{urlencode(auth_params)}"

            # 创建响应并设置 Cookie
            response = RedirectResponse(url=auth_url, status_code=status.HTTP_302_FOUND)
            _set_cookie(
                response,
                "dip.session_id",
                session_id,
                max_age=settings.cookie_timeout,
                domain=settings.cookie_domain if settings.cookie_domain else None,
            )

            logger.info("登录重定向成功")
            return response

        except Exception as e:
            logger.exception(f"登录失败: {e}")
            frontend_path = _get_frontend_path()
            return HTMLResponse(
                content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                status_code=status.HTTP_200_OK,
            )

    @router.get(
        "/login/callback",
        summary="登录回调接口",
        description="登录回调接口，接收回调请求",
        response_class=HTMLResponse,
    )
    async def login_callback(
        request: Request,
        code: str | None = Query(default=None, description="授权码"),
        state: str | None = Query(default=None, description="状态字符串"),
        error: str | None = Query(default=None, description="错误码"),
        error_description: str | None = Query(default=None, description="错误描述"),
        error_hint: str | None = Query(default=None, description="错误提示"),
    ):
        """
        登录回调接口。

        流程：
        1. 从 cookie 获取 session_id
        2. 验证参数
        3. 调用登录服务处理登录
        4. 设置 token 和 userid cookie
        5. 重定向或返回成功页面
        """
        try:
            # 获取 session_id
            session_id = _get_cookie_value(request, "dip.session_id")
            if not session_id:
                logger.warning("登录回调：Session ID 不存在")
                frontend_path = _get_frontend_path()
                return HTMLResponse(
                    content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                    status_code=status.HTTP_200_OK,
                )

            logger.info(f"登录回调 Session: {session_id}")

            # 验证参数
            if error or not code:
                if error and ("request_unauthorized" in error or "request_forbidden" in error):
                    logger.warning(f"登录回调：未授权 - {error}")
                    frontend_path = _get_frontend_path()
                    return HTMLResponse(
                        content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                        status_code=status.HTTP_200_OK,
                    )
                logger.error(f"登录回调：参数错误 - error: {error}, code: {code}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"code": "GET_CODE_FAILED", "description": "授权码或状态参数错误"},
                )

            if not state:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"code": "PUBLIC_INVALID_PARAMETER", "description": "状态参数缺失"},
                )

            logger.info(f"登录回调 Code: {code}")

            # 执行登录
            session_info = await login_service.do_login(code, state, session_id)

            # 创建响应
            if session_info.as_redirect:
                response = RedirectResponse(
                    url=session_info.as_redirect,
                    status_code=status.HTTP_302_FOUND,
                )
            else:
                frontend_path = _get_frontend_path("login-success")
                response = HTMLResponse(
                    content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                    status_code=status.HTTP_200_OK,
                )

            # 设置 Cookie
            if session_info.token:
                _set_cookie(
                    response,
                    "dip.oauth2_token",
                    session_info.token,
                    max_age=settings.cookie_timeout,
                    domain=settings.cookie_domain if settings.cookie_domain else None,
                )
            if session_info.userid:
                _set_cookie(
                    response,
                    "dip.userid",
                    session_info.userid,
                    max_age=settings.cookie_timeout,
                    domain=settings.cookie_domain if settings.cookie_domain else None,
                )

            logger.info("登录回调成功")
            return response

        except ValueError as e:
            logger.error(f"登录回调失败: {e}")
            frontend_path = _get_frontend_path("login-failed")
            return HTMLResponse(
                content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                status_code=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.exception(f"登录回调异常: {e}")
            frontend_path = _get_frontend_path()
            return HTMLResponse(
                content=f'<html><body><script>window.location.href="{frontend_path}";</script></body></html>',
                status_code=status.HTTP_200_OK,
            )

    return router

