"""
应用领域模型

定义应用相关的领域模型和实体。
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List


@dataclass
class Application:
    """
    应用领域模型。

    属性:
        id: 应用主键 ID
        key: 应用包唯一标识
        name: 应用名称
        description: 应用描述
        icon: 应用图标（Base64编码字符串）
        version: 当前版本号
        category: 应用所属分类
        release_config: 应用安装配置（helm release 名称列表）
        ontology_ids: 业务知识网络 ID 列表
        agent_ids: 智能体 ID 列表
        is_config: 是否完成配置
        updated_by: 更新者用户 ID
        updated_at: 更新时间
    """
    id: int
    key: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    version: Optional[str] = None
    category: Optional[str] = None
    release_config: List[str] = field(default_factory=list)
    ontology_ids: List[int] = field(default_factory=list)
    agent_ids: List[int] = field(default_factory=list)
    is_config: bool = False
    updated_by: str = ""
    updated_at: Optional[datetime] = None

    def has_icon(self) -> bool:
        """
        检查应用是否有图标。

        返回:
            bool: 是否有图标
        """
        return self.icon is not None and len(self.icon) > 0

    def is_configured(self) -> bool:
        """
        检查应用是否已完成配置。

        返回:
            bool: 是否完成配置
        """
        return self.is_config

    def has_ontologies(self) -> bool:
        """
        检查应用是否配置了业务知识网络。

        返回:
            bool: 是否有业务知识网络配置
        """
        return len(self.ontology_ids) > 0

    def has_agents(self) -> bool:
        """
        检查应用是否配置了智能体。

        返回:
            bool: 是否有智能体配置
        """
        return len(self.agent_ids) > 0


@dataclass
class OntologyInfo:
    """
    业务知识网络信息。

    属性:
        id: 业务知识网络 ID
        name: 业务知识网络名称
        description: 业务知识网络描述
    """
    id: int
    name: Optional[str] = None
    description: Optional[str] = None


@dataclass
class AgentInfo:
    """
    智能体信息。

    属性:
        id: 智能体 ID
        name: 智能体名称
        description: 智能体描述
    """
    id: int
    name: Optional[str] = None
    description: Optional[str] = None


@dataclass
class ManifestInfo:
    """
    应用安装包 manifest 信息。

    属性:
        key: 应用唯一标识
        name: 应用名称
        description: 应用描述
        version: 应用版本号
        category: 应用分类
        icon_path: 图标路径（相对于安装包根目录）
        charts: helm chart 列表
        images: 镜像列表
        ontologies: 业务知识网络导入配置
        agents: 智能体导入配置
    """
    key: str
    name: str
    version: str
    description: Optional[str] = None
    category: Optional[str] = None
    icon_path: Optional[str] = None
    charts: List[dict] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    ontologies: List[dict] = field(default_factory=list)
    agents: List[dict] = field(default_factory=list)
