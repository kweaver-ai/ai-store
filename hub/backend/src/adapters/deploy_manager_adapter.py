"""
Deploy Manager 适配器

实现 DeployManagerPort 接口的 HTTP 客户端适配器。
负责与部署管理服务交互。
"""
import logging

import httpx

from src.ports.deploy_manager_port import DeployManagerPort, GetHostResponse
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class DeployManagerAdapter(DeployManagerPort):
    """
    Deploy Manager 服务适配器。

    使用 HTTP 客户端与部署管理服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._base_url = settings.deploy_manager_url
        self._timeout = settings.deploy_manager_timeout

    async def get_host(self) -> GetHostResponse:
        """
        获取主机信息。

        返回:
            GetHostResponse: 主机信息

        异常:
            Exception: 当获取失败时抛出
        """
        url = f"{self._base_url}/api/deploy-manager/v1/host"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            data = response.json()
            
            return GetHostResponse(
                host=data.get("host", ""),
                port=data.get("port", ""),
                scheme=data.get("scheme", "https"),
            )

