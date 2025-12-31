"""
应用服务

应用层服务，负责编排应用管理操作。
该服务使用端口（接口），不依赖任何基础设施细节。
"""
import base64
import io
import json
import logging
import os
import shutil
import tempfile
import zipfile
from typing import List, Optional, BinaryIO
from datetime import datetime
from packaging import version as pkg_version

import yaml

from src.domains.application import (
    Application, ManifestInfo, MicroAppInfo,
    OntologyConfigItem, AgentConfigItem
)
from src.ports.application_port import ApplicationPort
from src.ports.external_service_port import (
    DeployInstallerPort,
    OntologyManagerPort,
    AgentFactoryPort,
)
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class ApplicationService:
    """
    应用服务。

    该服务属于应用层，通过端口编排应用管理的业务逻辑。
    """

    def __init__(
        self,
        application_port: ApplicationPort,
        deploy_installer_port: Optional[DeployInstallerPort] = None,
        ontology_manager_port: Optional[OntologyManagerPort] = None,
        agent_factory_port: Optional[AgentFactoryPort] = None,
        settings: Optional[Settings] = None,
    ):
        """
        初始化应用服务。

        参数:
            application_port: 应用端口实现（注入的适配器）
            deploy_installer_port: Deploy Installer 端口（可选）
            ontology_manager_port: Ontology Manager 端口（可选）
            agent_factory_port: Agent Factory 端口（可选）
            settings: 应用配置（可选）
        """
        self._application_port = application_port
        self._deploy_installer_port = deploy_installer_port
        self._ontology_manager_port = ontology_manager_port
        self._agent_factory_port = agent_factory_port
        self._settings = settings

    async def get_all_applications(self) -> List[Application]:
        """
        获取所有已安装的应用列表。

        返回:
            List[Application]: 应用列表
        """
        return await self._application_port.get_all_applications()

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
        return await self._application_port.get_application_by_key(key)

    async def get_application_by_id(self, app_id: int) -> Application:
        """
        根据应用主键 ID 获取应用信息。

        参数:
            app_id: 应用主键 ID

        返回:
            Application: 应用实体

        异常:
            ValueError: 当应用不存在时抛出
        """
        return await self._application_port.get_application_by_id(app_id)

    async def get_application_basic_info(self, app_id: int) -> Application:
        """
        获取应用基础信息。

        参数:
            app_id: 应用主键 ID

        返回:
            Application: 应用基础信息

        异常:
            ValueError: 当应用不存在时抛出
        """
        return await self._application_port.get_application_by_id(app_id)

    async def get_application_ontologies_by_id(
        self,
        app_id: int,
        auth_token: Optional[str] = None,
    ) -> List[dict]:
        """
        获取应用的业务知识网络详情列表。

        流程：
        1. 通过 id 获取应用的业务知识网络配置项（ontology_config）
        2. 遍历配置项，通过 id 调用外部接口查询业务知识网络详情
        3. 返回业务知识网络详情列表（原始数据）

        参数:
            app_id: 应用主键 ID
            auth_token: 认证 Token

        返回:
            List[dict]: 业务知识网络详情列表（原始数据）

        异常:
            ValueError: 当应用不存在时抛出
        """
        # 1. 通过 id 获取应用
        application = await self._application_port.get_application_by_id(app_id)
        
        # 2. 遍历配置项，通过 id 调用外部接口查询详情
        ontologies = []
        for config_item in application.ontology_config:
            try:
                if self._ontology_manager_port:
                    # 调用外部接口查询业务知识网络详情（返回原始数据）
                    kn_data = await self._ontology_manager_port.get_knowledge_network(
                        config_item.id,
                        auth_token=auth_token,
                        business_domain=application.business_domain,
                    )
                    ontologies.append(kn_data)
                else:
                    # 如果没有外部服务端口，返回基本信息
                    ontologies.append({"id": config_item.id})
            except Exception as e:
                logger.warning(f"获取业务知识网络详情失败 (ID: {config_item.id}): {e}")
                # 即使查询失败，也返回基本信息
                ontologies.append({"id": config_item.id})
        
        return ontologies

    async def get_application_agents_by_id(
        self,
        app_id: int,
        auth_token: Optional[str] = None,
    ) -> List[dict]:
        """
        获取应用的智能体详情列表。

        流程：
        1. 通过 id 获取应用的智能体配置项（agent_config）
        2. 遍历配置项，通过 id 调用外部接口查询智能体详情
        3. 返回智能体详情列表（原始数据）

        参数:
            app_id: 应用主键 ID
            auth_token: 认证 Token

        返回:
            List[dict]: 智能体详情列表（原始数据）

        异常:
            ValueError: 当应用不存在时抛出
        """
        # 1. 通过 id 获取应用
        application = await self._application_port.get_application_by_id(app_id)
        
        # 2. 遍历配置项，通过 id 调用外部接口查询详情
        agents = []
        for config_item in application.agent_config:
            try:
                if self._agent_factory_port:
                    # 调用外部接口查询智能体详情（返回原始数据）
                    agent_data = await self._agent_factory_port.get_agent(
                        config_item.id,
                        auth_token=auth_token,
                        business_domain=application.business_domain,
                    )
                    agents.append(agent_data)
                else:
                    # 如果没有外部服务端口，返回基本信息
                    agents.append({"id": config_item.id})
            except Exception as e:
                logger.warning(f"获取智能体详情失败 (ID: {config_item.id}): {e}")
                # 即使查询失败，也返回基本信息
                agents.append({"id": config_item.id})
        
        return agents

    async def configure_application(
        self,
        app_id: int,
        updated_by: str = "",
    ) -> Application:
        """
        配置应用的业务知识网络和智能体。

        根据应用当前在数据库中的业务知识网络配置 (ontology_config)
        和智能体配置 (agent_config)，将每一项的 is_config 设置为 True。

        参数:
            app_id: 应用主键 ID
            updated_by: 更新者用户 ID

        返回:
            Application: 更新后的应用

        异常:
            ValueError: 当应用不存在时抛出
        """
        # 获取现有应用
        application = await self._application_port.get_application_by_id(app_id)

        # 基于现有配置，将 is_config 统一置为 True
        new_ontology_config = [
            OntologyConfigItem(id=item.id, is_config=True)
            for item in application.ontology_config
        ]
        new_agent_config = [
            AgentConfigItem(id=item.id, is_config=True)
            for item in application.agent_config
        ]

        # 更新配置
        return await self._application_port.update_application_config(
            key=app_id,
            ontology_config=new_ontology_config,
            agent_config=new_agent_config,
            updated_by=updated_by,
        )

    async def install_application(
        self,
        zip_data: BinaryIO,
        updated_by: str = "",
        auth_token: Optional[str] = None,
    ) -> Application:
        """
        安装应用。

        流程：
        1. 将 zip 数据写入临时文件
        2. 解压并校验安装包结构和 manifest.yaml
        3. 解析 application.key，校验 version
        4. 如果应用已存在，版本号必须大于已上传版本
        5. 解压安装包，上传镜像和 Chart
        6. 导入业务知识网络和 DataAgent 智能体
        7. 更新应用信息

        参数:
            zip_data: ZIP 格式应用安装包数据
            updated_by: 更新者用户 ID

        返回:
            Application: 安装后的应用

        异常:
            ValueError: 当安装包格式错误或版本冲突时抛出
        """
        temp_dir = None
        try:
            # 创建临时目录
            temp_base = self._settings.temp_dir if self._settings else "/tmp/dip-hub"
            os.makedirs(temp_base, exist_ok=True)
            temp_dir = tempfile.mkdtemp(dir=temp_base)
            
            # 保存 zip 文件
            zip_path = os.path.join(temp_dir, "package.zip")
            with open(zip_path, "wb") as f:
                shutil.copyfileobj(zip_data, f)
            
            # 解压 zip 文件
            extract_dir = os.path.join(temp_dir, "extracted")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # 查找 manifest.yaml 文件
            # 1. 先在根目录查找
            manifest_path = os.path.join(extract_dir, "manifest.yaml")
            if not os.path.exists(manifest_path):
                manifest_path = os.path.join(extract_dir, "manifest.yml")
            
            # 2. 如果根目录没有，查找 application.key 文件所在的目录
            if not os.path.exists(manifest_path):
                # 查找 application.key 文件
                app_key_path = None
                for root, dirs, files in os.walk(extract_dir):
                    if "application.key" in files:
                        app_key_path = root
                        break
                
                if app_key_path:
                    # 在 application.key 所在目录查找 manifest.yaml
                    manifest_path = os.path.join(app_key_path, "manifest.yaml")
                    if not os.path.exists(manifest_path):
                        manifest_path = os.path.join(app_key_path, "manifest.yml")
            
            # 3. 如果还是没找到，递归查找所有 manifest.yaml 文件
            if not os.path.exists(manifest_path):
                for root, dirs, files in os.walk(extract_dir):
                    if "manifest.yaml" in files:
                        manifest_path = os.path.join(root, "manifest.yaml")
                        break
                    elif "manifest.yml" in files:
                        manifest_path = os.path.join(root, "manifest.yml")
                        break
            
            if not os.path.exists(manifest_path):
                raise ValueError("安装包缺少 manifest.yaml 文件")
            
            # 获取 manifest.yaml 所在的目录，作为应用包的根目录
            manifest_dir = os.path.dirname(manifest_path)
            
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest_data = yaml.safe_load(f)
            
            manifest = self._parse_manifest(manifest_data)
            
            # 校验版本
            existing_app = await self._application_port.get_application_by_key_optional(manifest.key)
            if existing_app:
                if manifest.version == existing_app.version:
                    raise ValueError(
                        f"版本号冲突: 新版本 {manifest.version} 与已安装版本相同。"
                        f"请更新版本号或先卸载现有应用 (key: {manifest.key})"
                    )
                if not self._is_version_greater(manifest.version, existing_app.version):
                    raise ValueError(
                        f"版本号冲突: 新版本 {manifest.version} 必须大于已安装版本 {existing_app.version}。"
                        f"当前已安装版本: {existing_app.version} (key: {manifest.key})"
                    )
                logger.info(
                    f"版本校验通过: 新版本 {manifest.version} > 已安装版本 {existing_app.version} (key: {manifest.key})"
                )
            
            # 读取图标（路径相对于 manifest.yaml 所在目录）
            icon_base64 = None
            if manifest.icon_path:
                icon_full_path = os.path.join(manifest_dir, manifest.icon_path)
                if os.path.exists(icon_full_path):
                    with open(icon_full_path, "rb") as f:
                        icon_base64 = base64.b64encode(f.read()).decode("utf-8")
            
            # 上传镜像（路径相对于 manifest.yaml 所在目录）
            release_configs = []
            if self._deploy_installer_port:
                for image_path in manifest.images:
                    image_full_path = os.path.join(manifest_dir, image_path)
                    if os.path.exists(image_full_path):
                        with open(image_full_path, "rb") as f:
                            await self._deploy_installer_port.upload_image(f, auth_token=auth_token)
                
                # 上传 Chart 并安装（路径相对于 manifest.yaml 所在目录）
                for chart_config in manifest.charts:
                    chart_path = chart_config.get("path", "")
                    chart_full_path = os.path.join(manifest_dir, chart_path)
                    if os.path.exists(chart_full_path):
                        with open(chart_full_path, "rb") as f:
                            chart_result = await self._deploy_installer_port.upload_chart(f, auth_token=auth_token)
                        
                        # 安装 release
                        release_name = chart_config.get("release_name", chart_result.chart.name)
                        namespace = chart_config.get("namespace", "anyshare")
                        values = chart_result.values
                        
                        await self._deploy_installer_port.install_release(
                            release_name=release_name,
                            namespace=namespace,
                            chart_name=chart_result.chart.name,
                            chart_version=chart_result.chart.version,
                            values=values,
                            auth_token=auth_token,
                        )
                        release_configs.append(release_name)
            
            # 导入业务知识网络（从 ontologies 目录读取 JSON 文件）
            ontology_config = []
            if self._ontology_manager_port:
                ontologies_dir = os.path.join(manifest_dir, "ontologies")
                if os.path.exists(ontologies_dir) and os.path.isdir(ontologies_dir):
                    for filename in os.listdir(ontologies_dir):
                        if filename.endswith(('.json', '.yaml', '.yml')):
                            ontology_file_path = os.path.join(ontologies_dir, filename)
                            try:
                                with open(ontology_file_path, "r", encoding="utf-8") as f:
                                    if filename.endswith('.json'):
                                        onto_config = json.load(f)
                                    else:
                                        onto_config = yaml.safe_load(f)
                                
                                logger.info(f"从文件读取业务知识网络配置: {filename}")
                                onto_id = await self._ontology_manager_port.create_knowledge_network(
                                    onto_config,
                                    auth_token=auth_token,
                                    business_domain=manifest.business_domain,
                                )
                                if onto_id:
                                    ontology_config.append(OntologyConfigItem(
                                        id=str(onto_id),
                                        is_config=False,  # 安装时默认为未配置
                                    ))
                                    logger.info(f"成功导入业务知识网络: {onto_id}")
                            except Exception as e:
                                logger.warning(f"导入业务知识网络失败 ({filename}): {e}")
            
            # 导入智能体（从 agents 目录读取 JSON 文件）
            agent_config = []
            if self._agent_factory_port:
                agents_dir = os.path.join(manifest_dir, "agents")
                if os.path.exists(agents_dir) and os.path.isdir(agents_dir):
                    for filename in os.listdir(agents_dir):
                        if filename.endswith(('.json', '.yaml', '.yml')):
                            agent_file_path = os.path.join(agents_dir, filename)
                            try:
                                with open(agent_file_path, "r", encoding="utf-8") as f:
                                    if filename.endswith('.json'):
                                        agent_config_data = json.load(f)
                                    else:
                                        agent_config_data = yaml.safe_load(f)
                                
                                logger.info(f"从文件读取智能体配置: {filename}")
                                agent_result = await self._agent_factory_port.create_agent(
                                    agent_config_data,
                                    auth_token=auth_token,
                                    business_domain=manifest.business_domain,
                                )
                                if agent_result.id:
                                    agent_config.append(AgentConfigItem(
                                        id=str(agent_result.id),
                                        is_config=False,  # 安装时默认为未配置
                                    ))
                                    logger.info(f"成功导入智能体: {agent_result.id}")
                            except Exception as e:
                                logger.warning(f"导入智能体失败 ({filename}): {e}")
            
            # 创建或更新应用
            application = Application(
                id=existing_app.id if existing_app else 0,
                key=manifest.key,
                name=manifest.name,
                description=manifest.description,
                icon=icon_base64,
                version=manifest.version,
                category=manifest.category,
                business_domain=manifest.business_domain,
                micro_app=manifest.micro_app,
                release_config=release_configs,
                ontology_config=ontology_config,
                agent_config=agent_config,
                is_config=False,  # 安装后需要手动配置
                updated_by=updated_by,
                updated_at=datetime.now(),
            )
            
            if existing_app:
                # 更新现有应用
                return await self._application_port.update_application(application)
            else:
                # 创建新应用
                return await self._application_port.create_application(application)
        
        finally:
            # 清理临时目录
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    async def uninstall_application(
        self,
        app_id: int,
        auth_token: Optional[str] = None,
    ) -> bool:
        """
        卸载应用。

        流程：
        1. 获取应用信息
        2. 调用 Deploy Installer 删除 Release
        3. 删除数据库中的应用记录

        参数:
            app_id: 应用主键 ID

        返回:
            bool: 是否卸载成功

        异常:
            ValueError: 当应用不存在时抛出
        """
        # 获取应用信息
        application = await self._application_port.get_application_by_id(app_id)
        
        # 删除 Release
        if self._deploy_installer_port and application.release_config:
            for release_name in application.release_config:
                try:
                    await self._deploy_installer_port.delete_release(
                        release_name=release_name,
                        namespace="default",  # TODO: 从配置中获取
                        auth_token=auth_token,
                    )
                except Exception as e:
                    logger.warning(f"删除 Release 失败 ({release_name}): {e}")
        
        # 删除数据库记录
        return await self._application_port.delete_application_by_id(app_id)

    async def create_application(self, application: Application) -> Application:
        """
        创建新应用。

        参数:
            application: 应用实体

        返回:
            Application: 创建后的应用实体

        异常:
            ValueError: 当应用 key 已存在时抛出
        """
        return await self._application_port.create_application(application)

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
        return await self._application_port.update_application(application)

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
        return await self._application_port.delete_application(key)

    def _parse_manifest(self, data: dict) -> ManifestInfo:
        """
        解析 manifest 数据。

        参数:
            data: manifest 字典数据

        返回:
            ManifestInfo: 解析后的 manifest 信息

        异常:
            ValueError: 当必填字段缺失时抛出
        """
        key = data.get("key")
        name = data.get("name")
        version = data.get("version")
        manifest_version = data.get("manifest_version", 1)
        
        if not key:
            raise ValueError("manifest.yaml 缺少 key 字段")
        if not name:
            raise ValueError("manifest.yaml 缺少 name 字段")
        if not version:
            raise ValueError("manifest.yaml 缺少 version 字段")
        
        # 解析 micro-app 配置
        micro_app = None
        micro_app_data = data.get("micro-app")
        if micro_app_data:
            micro_app_name = micro_app_data.get("name")
            micro_app_entry = micro_app_data.get("entry")
            if not micro_app_name:
                raise ValueError("manifest.yaml 中 micro-app.name 字段缺失")
            if not micro_app_entry:
                raise ValueError("manifest.yaml 中 micro-app.entry 字段缺失")
            micro_app = MicroAppInfo(
                name=micro_app_name,
                entry=micro_app_entry,
                headless=micro_app_data.get("headless", False),
            )
        
        return ManifestInfo(
            key=key,
            name=name,
            version=version,
            manifest_version=manifest_version,
            description=data.get("description"),
            category=data.get("category"),
            business_domain=data.get("business-domain", "db_public"),
            micro_app=micro_app,
            icon_path=data.get("icon"),
            charts=data.get("charts", []),
            images=data.get("images", []),
            ontologies=data.get("ontologies", []),
            agents=data.get("agents", []),
        )

    def _is_version_greater(self, new_version: str, old_version: Optional[str]) -> bool:
        """
        检查新版本是否大于旧版本。

        参数:
            new_version: 新版本号
            old_version: 旧版本号

        返回:
            bool: 新版本是否大于旧版本
        """
        if not old_version:
            return True
        
        try:
            return pkg_version.parse(new_version) > pkg_version.parse(old_version)
        except Exception:
            # 无法解析版本号时，使用字符串比较
            return new_version > old_version
