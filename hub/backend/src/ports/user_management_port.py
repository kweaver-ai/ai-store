"""
User Management 端口接口

定义用户管理操作的抽象接口（端口）。
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class UserInfo:
    """用户信息"""
    id: str
    account: str
    vision_name: str
    email: Optional[str] = None


class UserManagementPort(ABC):
    """
    User Management 端口接口。

    这是一个输出端口（被驱动端口），定义了应用程序与用户管理服务的交互方式。
    """

    @abstractmethod
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
        pass

