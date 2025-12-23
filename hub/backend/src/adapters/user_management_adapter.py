"""
User Management 适配器

实现 UserManagementPort 接口的 HTTP 客户端适配器。
负责与用户管理服务交互。
"""
import logging
from typing import Dict

import httpx

from src.ports.user_management_port import UserManagementPort, UserInfo
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class UserManagementAdapter(UserManagementPort):
    """
    User Management 服务适配器。

    使用 HTTP 客户端与用户管理服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._base_url = settings.user_management_url
        self._timeout = settings.user_management_timeout

    async def batch_get_user_info_by_id(self, user_ids: list[str]) -> Dict[str, UserInfo]:
        """
        批量获取用户信息。

        参数:
            user_ids: 用户 ID 列表

        返回:
            Dict[str, UserInfo]: 用户信息字典，key 为用户 ID

        异常:
            Exception: 当获取失败时抛出
        """
        url = f"{self._base_url}/api/user-management/v1/users/batch"
        
        data = {
            "user_ids": user_ids,
        }
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            
            result_data = response.json()
            users = result_data.get("users", {})
            
            user_info_dict = {}
            for user_id, user_data in users.items():
                user_info_dict[user_id] = UserInfo(
                    id=user_data.get("id", user_id),
                    account=user_data.get("account", ""),
                    vision_name=user_data.get("vision_name", ""),
                    email=user_data.get("email"),
                )
            
            return user_info_dict

