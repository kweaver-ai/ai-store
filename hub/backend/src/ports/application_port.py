"""
应用端口接口

定义应用操作的抽象接口（端口）。
遵循六边形架构模式，这些端口定义了领域层与基础设施层之间的契约。
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from src.domains.application import Application


class ApplicationPort(ABC):
    """
    应用端口接口。

    这是一个输出端口（被驱动端口），定义了应用程序与外部应用数据存储的交互方式。
    """

    @abstractmethod
    async def get_all_applications(self) -> List[Application]:
        """
        获取所有已安装的应用列表。

        返回:
            List[Application]: 应用列表
        """
        pass

    @abstractmethod
    async def get_application_by_key(self, key: str) -> Application:
        """
        根据应用唯一标识获取应用信息。

        参数:
            key: 应用包唯一标识

        返回:
            Application: 应用实体

        异常:
            ValueError: 当应用不存在时抛出
        """
        pass

    @abstractmethod
    async def get_application_by_key_optional(self, key: str) -> Optional[Application]:
        """
        根据应用唯一标识获取应用信息（可选）。

        参数:
            key: 应用包唯一标识

        返回:
            Optional[Application]: 应用实体，不存在时返回 None
        """
        pass

    @abstractmethod
    async def create_application(self, application: Application) -> Application:
        """
        创建新应用。

        参数:
            application: 应用实体

        返回:
            Application: 创建后的应用实体（包含生成的 ID）

        异常:
            ValueError: 当应用 key 已存在时抛出
        """
        pass

    @abstractmethod
    async def update_application(self, application: Application) -> Application:
        """
        更新应用信息。

        参数:
            application: 应用实体

        返回:
            Application: 更新后的应用实体

        异常:
            ValueError: 当应用不存在时抛出
        """
        pass

    @abstractmethod
    async def update_application_config(
        self,
        key: str,
        ontology_ids: List[int],
        agent_ids: List[int],
        updated_by: str
    ) -> Application:
        """
        更新应用配置（业务知识网络和智能体）。

        参数:
            key: 应用唯一标识
            ontology_ids: 业务知识网络 ID 列表
            agent_ids: 智能体 ID 列表
            updated_by: 更新者用户 ID

        返回:
            Application: 更新后的应用实体

        异常:
            ValueError: 当应用不存在时抛出
        """
        pass

    @abstractmethod
    async def delete_application(self, key: str) -> bool:
        """
        删除应用。

        参数:
            key: 应用包唯一标识

        返回:
            bool: 是否删除成功

        异常:
            ValueError: 当应用不存在时抛出
        """
        pass
