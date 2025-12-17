"""
外部服务适配器

实现外部服务端口接口的 HTTP 客户端适配器。
负责与 Deploy Installer、Ontology Manager、Agent Factory 服务交互。
"""
import logging
from typing import List, BinaryIO, Optional
import httpx

from src.ports.external_service_port import (
    DeployInstallerPort,
    OntologyManagerPort,
    AgentFactoryPort,
    ImageUploadResult,
    ChartInfo,
    ChartUploadResult,
    ReleaseResult,
    KnowledgeNetworkInfo,
    AgentFactoryResult,
)
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class DeployInstallerAdapter(DeployInstallerPort):
    """
    Deploy Installer 服务适配器。

    使用 HTTP 客户端与 Deploy Installer 服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._base_url = f"{settings.proton_url}/internal/api/deploy-installer/v1"
        self._timeout = settings.proton_timeout

    async def upload_image(self, image_data: BinaryIO) -> List[ImageUploadResult]:
        """
        上传镜像。

        参数:
            image_data: 镜像数据

        返回:
            List[ImageUploadResult]: 上传的镜像列表
        """
        url = f"{self._base_url}/agents/image"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.put(
                url,
                content=image_data.read(),
                headers={"Content-Type": "application/octet-stream"},
            )
            response.raise_for_status()
            
            data = response.json()
            images = data.get("images", [])
            
            return [
                ImageUploadResult(
                    from_name=img.get("from", ""),
                    to_name=img.get("to", ""),
                )
                for img in images
            ]

    async def upload_chart(self, chart_data: BinaryIO) -> ChartUploadResult:
        """
        上传 Chart。

        参数:
            chart_data: Chart 数据

        返回:
            ChartUploadResult: Chart 上传结果
        """
        url = f"{self._base_url}/agents/chart"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.put(
                url,
                content=chart_data.read(),
                headers={"Content-Type": "application/octet-stream"},
            )
            response.raise_for_status()
            
            data = response.json()
            chart_data = data.get("chart", {})
            
            return ChartUploadResult(
                chart=ChartInfo(
                    name=chart_data.get("name", ""),
                    version=chart_data.get("version", ""),
                ),
                values=data.get("values", {}),
            )

    async def install_release(
        self,
        release_name: str,
        namespace: str,
        chart_name: str,
        chart_version: str,
        values: dict,
        set_registry: bool = True
    ) -> ReleaseResult:
        """
        安装/更新 Release。

        参数:
            release_name: 实例名
            namespace: 命名空间
            chart_name: Chart 名称
            chart_version: Chart 版本
            values: 配置值
            set_registry: 是否配置镜像仓库地址

        返回:
            ReleaseResult: Release 结果
        """
        url = f"{self._base_url}/agents/release/{release_name}"
        params = {
            "namespace": namespace,
            "set-registry": str(set_registry).lower(),
        }
        body = {
            "name": chart_name,
            "version": chart_version,
            "values": values,
        }
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                url,
                params=params,
                json=body,
            )
            response.raise_for_status()
            
            data = response.json()
            return ReleaseResult(values=data.get("values", {}))

    async def delete_release(self, release_name: str, namespace: str) -> ReleaseResult:
        """
        删除 Release。

        参数:
            release_name: 实例名
            namespace: 命名空间

        返回:
            ReleaseResult: Release 删除结果
        """
        url = f"{self._base_url}/agents/release/{release_name}"
        params = {"namespace": namespace}
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.delete(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return ReleaseResult(values=data.get("values", {}))


class OntologyManagerAdapter(OntologyManagerPort):
    """
    Ontology Manager 服务适配器。

    使用 HTTP 客户端与 Ontology Manager 服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._base_url = f"{settings.adp_url}/api/ontology-manager/v1"
        self._timeout = settings.adp_timeout

    async def get_knowledge_network(self, kn_id: str) -> KnowledgeNetworkInfo:
        """
        获取业务知识网络详情。

        参数:
            kn_id: 业务知识网络 ID

        返回:
            KnowledgeNetworkInfo: 业务知识网络信息

        异常:
            ValueError: 当业务知识网络不存在时抛出
        """
        url = f"{self._base_url}/knowledge-networks/{kn_id}"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.get(url)
            
            if response.status_code == 404:
                raise ValueError(f"业务知识网络不存在: {kn_id}")
            
            response.raise_for_status()
            
            data = response.json()
            return KnowledgeNetworkInfo(
                id=data.get("id", kn_id),
                name=data.get("name", ""),
                comment=data.get("comment"),
            )

    async def create_knowledge_network(self, data: dict) -> str:
        """
        创建业务知识网络。

        参数:
            data: 创建请求数据

        返回:
            str: 创建的业务知识网络 ID
        """
        url = f"{self._base_url}/knowledge-networks"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            
            result = response.json()
            # 返回的是 ID 数组
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("id", "")
            return ""


class AgentFactoryAdapter(AgentFactoryPort):
    """
    Agent Factory 服务适配器。

    使用 HTTP 客户端与 Agent Factory 服务交互。
    """

    def __init__(self, settings: Settings):
        """
        初始化适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._base_url = f"{settings.adp_url}/api/agent-factory/v3"
        self._timeout = settings.adp_timeout

    async def create_agent(self, data: dict) -> AgentFactoryResult:
        """
        创建智能体。

        参数:
            data: 创建请求数据

        返回:
            AgentFactoryResult: 创建结果
        """
        url = f"{self._base_url}/agent"
        
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            
            result = response.json()
            return AgentFactoryResult(
                id=result.get("id", ""),
                version=result.get("version", "v0"),
            )

