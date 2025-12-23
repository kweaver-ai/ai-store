"""
登录服务

实现登录相关的业务逻辑。
"""
import logging
import secrets
from typing import Optional, Tuple

from src.domains.session import SessionInfo
from src.domains.login import LoginRequest
from src.ports.session_port import SessionPort
from src.ports.oauth2_port import OAuth2Port
from src.ports.hydra_port import HydraPort
from src.ports.user_management_port import UserManagementPort
from src.ports.deploy_manager_port import DeployManagerPort

logger = logging.getLogger(__name__)


class LoginService:
    """
    登录服务。

    负责处理登录相关的业务逻辑。
    """

    def __init__(
        self,
        session_port: SessionPort,
        oauth2_port: OAuth2Port,
        hydra_port: HydraPort,
        user_management_port: UserManagementPort,
        deploy_manager_port: DeployManagerPort,
    ):
        """
        初始化登录服务。

        参数:
            session_port: Session 端口
            oauth2_port: OAuth2 端口
            hydra_port: Hydra 端口
            user_management_port: 用户管理端口
            deploy_manager_port: 部署管理端口
        """
        self._session_port = session_port
        self._oauth2_port = oauth2_port
        self._hydra_port = hydra_port
        self._user_management_port = user_management_port
        self._deploy_manager_port = deploy_manager_port

    def generate_state(self, length: int = 30) -> str:
        """
        生成随机 state 字符串。

        参数:
            length: 字符串长度

        返回:
            str: 随机字符串
        """
        return secrets.token_urlsafe(length)

    def generate_nonce(self, length: int = 30) -> str:
        """
        生成随机 nonce 字符串。

        参数:
            length: 字符串长度

        返回:
            str: 随机字符串
        """
        return secrets.token_urlsafe(length)

    async def check_token_effect(self, token: str) -> bool:
        """
        检查 Token 是否有效。

        参数:
            token: 访问令牌

        返回:
            bool: Token 是否有效
        """
        try:
            introspect = await self._hydra_port.introspect(token)
            return introspect.active
        except Exception as e:
            logger.error(f"检查 Token 有效性失败: {e}", exc_info=True)
            return False

    async def get_or_create_session(
        self,
        session_id: str | None,
        state: str,
        platform: int,
        as_redirect: str | None = None,
    ) -> Tuple[str, SessionInfo]:
        """
        获取或创建 Session。

        参数:
            session_id: 现有的 Session ID，如果为 None 则创建新的
            state: 状态字符串
            platform: 平台类型
            as_redirect: AnyShare 重定向地址

        返回:
            tuple[str, SessionInfo]: (Session ID, Session 信息)
        """
        if session_id:
            session_info = await self._session_port.get_session(session_id)
            if session_info:
                # 更新 Session 信息
                if session_info.platform != platform or session_info.as_redirect != as_redirect:
                    session_info.platform = platform
                    session_info.as_redirect = as_redirect
                    await self._session_port.save_session(session_id, session_info)
                return session_id, session_info

        # 创建新的 Session
        import uuid
        new_session_id = str(uuid.uuid4())
        session_info = SessionInfo(
            state=state,
            platform=platform,
            as_redirect=as_redirect,
        )
        await self._session_port.save_session(new_session_id, session_info)
        return new_session_id, session_info

    async def get_host_url(self) -> str:
        """
        获取主机 URL。

        返回:
            str: 主机 URL
        """
        host_res = await self._deploy_manager_port.get_host()
        return f"{host_res.scheme}://{host_res.host}:{host_res.port}"

    async def do_login(self, code: str, state: str, session_id: str) -> SessionInfo:
        """
        执行登录流程。

        参数:
            code: 授权码
            state: 状态字符串
            session_id: Session ID

        返回:
            SessionInfo: 登录后的 Session 信息

        异常:
            ValueError: 当登录失败时抛出
        """
        # 获取 Session 信息
        session_info = await self._session_port.get_session(session_id)
        if session_info is None:
            raise ValueError("Session 不存在")
        
        if session_info.state != state:
            raise ValueError("State 不匹配")

        # 获取主机信息
        host_res = await self._deploy_manager_port.get_host()
        access_url = f"{host_res.scheme}://{host_res.host}:{host_res.port}"

        # 将授权码转换为 Token
        redirect_uri = f"{access_url}/api/dip-hub/v1/login/callback"
        code2token_res = await self._oauth2_port.code2token(code, redirect_uri)

        # 内省 Token 获取用户信息
        introspect = await self._hydra_port.introspect(code2token_res.access_token)
        if not introspect.active:
            raise ValueError("Token 无效")

        userid = introspect.visitor_id
        if not userid:
            raise ValueError("无法获取用户 ID")

        # 获取用户详细信息
        user_infos = await self._user_management_port.batch_get_user_info_by_id([userid])
        if userid not in user_infos:
            raise ValueError("用户信息不存在")

        userinfo = user_infos[userid]

        # 更新 Session 信息
        session_info.token = code2token_res.access_token
        session_info.refresh_token = code2token_res.refresh_token
        session_info.id_token = code2token_res.id_token
        session_info.userid = userid
        session_info.username = userinfo.vision_name
        session_info.vision_name = userinfo.vision_name
        session_info.visitor_typ = introspect.visitor_typ

        # 保存 Session
        await self._session_port.save_session(session_id, session_info)

        logger.info(f"用户登录成功: {userid}")
        return session_info

