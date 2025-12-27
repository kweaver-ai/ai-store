"""
OAuth2 适配器

实现 OAuth2Port 接口的 HTTP 客户端适配器。
负责与 OAuth2 服务交互。
"""
import logging
from urllib.parse import urlencode

import httpx

from src.ports.oauth2_port import OAuth2Port, Code2TokenResponse, RefreshTokenResponse
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class OAuth2Adapter(OAuth2Port):
    """
    OAuth2 服务适配器。

    使用 HTTP 客户端与 OAuth2 服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._timeout = 30

    async def code2token(self, code: str, redirect_uri: str) -> Code2TokenResponse:
        """
        将授权码转换为访问令牌。

        参数:
            code: 授权码
            redirect_uri: 重定向 URI

        返回:
            Code2TokenResponse: Token 响应

        异常:
            Exception: 当转换失败时抛出
        """
        # 从 redirect_uri 中提取 base URL
        base_url = redirect_uri.split("/oauth2")[0] if "/oauth2" in redirect_uri else redirect_uri
        
        # OAuth2 token 端点
        token_url = f"{base_url}/oauth2/token"
        
        # 准备请求数据
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self._settings.oauth_client_id,
        }
        
        # 禁用 SSL 证书验证以避免 certificate_verify_failed
        async with httpx.AsyncClient(timeout=self._timeout, verify=False) as client:
            response = await client.post(
                token_url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            
            token_data = response.json()
            
            return Code2TokenResponse(
                access_token=token_data.get("access_token", ""),
                refresh_token=token_data.get("refresh_token"),
                id_token=token_data.get("id_token"),
                token_type=token_data.get("token_type", "Bearer"),
                expires_in=token_data.get("expires_in"),
            )

    async def refresh_token(self, refresh_token: str) -> RefreshTokenResponse:
        """
        刷新访问令牌。

        参数:
            refresh_token: 刷新令牌

        返回:
            RefreshTokenResponse: Token 响应

        异常:
            Exception: 当刷新失败时抛出
        """
        # 从 Hydra 配置获取 base URL
        base_url = self._settings.hydra_host.replace("/admin", "").rstrip("/")
        
        # OAuth2 token 端点
        token_url = f"{base_url}/oauth2/token"
        
        # 准备请求数据
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self._settings.oauth_client_id,
        }
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                token_url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            
            token_data = response.json()
            
            return RefreshTokenResponse(
                access_token=token_data.get("access_token", ""),
                refresh_token=token_data.get("refresh_token"),
                id_token=token_data.get("id_token"),
                token_type=token_data.get("token_type", "Bearer"),
                expires_in=token_data.get("expires_in"),
            )

    async def revoke_token(self, token: str) -> None:
        """
        撤销令牌。

        参数:
            token: 要撤销的令牌（可以是 access_token 或 refresh_token）

        异常:
            Exception: 当撤销失败时抛出
        """
        # 从 Hydra 配置获取 base URL
        base_url = self._settings.hydra_host.replace("/admin", "").rstrip("/")
        
        # OAuth2 revoke 端点
        revoke_url = f"{base_url}/oauth2/revoke"
        
        # 准备请求数据
        data = {
            "token": token,
        }
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                revoke_url,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()

