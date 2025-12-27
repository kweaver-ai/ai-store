"""
应用配置管理

使用 pydantic-settings 进行配置管理。
配置可以通过环境变量或 .env 文件进行设置。
"""
import os
from functools import lru_cache
from typing import Optional

import yaml
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# OAuth registry 配置文件路径
OAUTH_REGISTRY_CONFIG_PATH = "/etc/globalConfig/oauth/oauth-registry-info.yaml"


def _load_oauth_client_id_from_registry() -> Optional[str]:
    """
    从 oauth-registry-info.yaml 文件中读取 dip-hub 的 oauthClientID。
    
    返回:
        Optional[str]: OAuth 客户端 ID，如果文件不存在或解析失败则返回 None。
    """
    if not os.path.exists(OAUTH_REGISTRY_CONFIG_PATH):
        return None
    
    try:
        with open(OAUTH_REGISTRY_CONFIG_PATH, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        
        if config and "dip-hub" in config:
            return config["dip-hub"].get("oauthClientID")
    except Exception:
        pass
    
    return None


class Settings(BaseSettings):
    """
    应用配置。
    
    所有配置都可以通过环境变量进行设置。
    环境变量需要以 'DIP_HUB_' 为前缀。
    """
    
    model_config = SettingsConfigDict(
        env_prefix="DIP_HUB_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # 应用配置
    app_name: str = Field(default="DIP Hub", description="应用名称")
    app_version: str = Field(default="1.0.0", description="应用版本")
    debug: bool = Field(default=False, description="调试模式")
    
    # 服务器配置
    host: str = Field(default="0.0.0.0", description="服务器监听地址")
    port: int = Field(default=8000, description="服务器监听端口")
    workers: int = Field(default=1, description="工作进程数")
    
    # API 配置
    api_prefix: str = Field(default="/api/dip-hub/v1", description="API 前缀")
    
    # 日志配置
    log_level: str = Field(default="INFO", description="日志级别")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="日志格式"
    )
    
    # 健康检查配置
    health_check_timeout: int = Field(default=5, description="健康检查超时时间（秒）")

    # 临时文件配置
    temp_dir: str = Field(default="/tmp/dip-hub", description="临时文件目录")

    # 数据库配置
    db_host: str = Field(default="localhost", description="数据库主机")
    db_port: int = Field(default=3306, description="数据库端口")
    db_name: str = Field(default="dip", description="数据库名称")
    db_user: str = Field(default="root", description="数据库用户名")
    db_password: str = Field(default="", description="数据库密码")

    # Proton 部署服务配置
    proton_url: str = Field(default="http://localhost", description="Proton 服务地址")
    proton_timeout: int = Field(default=300, description="Proton 请求超时时间（秒）")

    # Ontology Manager 服务配置
    ontology_manager_url: str = Field(
        default="http://ontology-manager", 
        description="Ontology Manager 服务地址"
    )
    ontology_manager_timeout: int = Field(
        default=60, 
        description="Ontology Manager 请求超时时间（秒）"
    )

    # Agent Factory 服务配置
    agent_factory_url: str = Field(
        default="http://agent-factory", 
        description="Agent Factory 服务地址"
    )
    agent_factory_timeout: int = Field(
        default=60, 
        description="Agent Factory 请求超时时间（秒）"
    )

    # Mock 模式配置
    use_mock_services: bool = Field(
        default=False, 
        description="是否使用 Mock 外部服务（用于本地开发调试）"
    )

    # Redis 配置
    redis_host: str = Field(default="localhost:6379", description="Redis 主机地址")
    redis_password: Optional[str] = Field(default=None, description="Redis 密码")
    redis_db: int = Field(default=1, description="Redis 数据库编号")
    redis_min_idle_conns: int = Field(default=8, description="Redis 最小空闲连接数")

    # OAuth2 配置
    oauth_client_id: str = Field(default="", description="OAuth2 客户端 ID")
    oauth_client_id2: Optional[str] = Field(default=None, description="OAuth2 客户端 ID2")

    @model_validator(mode="after")
    def load_oauth_client_id_from_registry(self) -> "Settings":
        """
        从 oauth-registry-info.yaml 文件中加载 oauth_client_id。
        
        优先级逻辑：
        1. 如果配置文件中有值，使用配置文件中的值（最高优先级）
        2. 如果配置文件中没有值，但环境变量有值，保持环境变量的值
        3. 如果都没有，使用默认空字符串
        """
        registry_client_id = _load_oauth_client_id_from_registry()
        if registry_client_id:
            # 配置文件中有值，优先使用
            object.__setattr__(self, "oauth_client_id", registry_client_id)
        # 如果配置文件没有值，保持环境变量加载的值（pydantic-settings 默认行为）
        return self

    # Hydra 配置
    hydra_host: str = Field(
        default="http://localhost:4445",
        description="Hydra 管理服务地址"
    )
    hydra_timeout: int = Field(default=30, description="Hydra 请求超时时间（秒）")

    # User Management 服务配置
    user_management_url: str = Field(
        default="http://user-management",
        description="User Management 服务地址"
    )
    user_management_timeout: int = Field(
        default=60,
        description="User Management 请求超时时间（秒）"
    )

    # Deploy Manager 服务配置
    deploy_manager_url: str = Field(
        default="http://deploy-manager",
        description="Deploy Manager 服务地址"
    )
    deploy_manager_timeout: int = Field(
        default=60,
        description="Deploy Manager 请求超时时间（秒）"
    )

    # Session Cookie 配置
    cookie_domain: str = Field(default="", description="Cookie 域名")
    cookie_timeout: int = Field(default=3600, description="Cookie 超时时间（秒）")

    # 前端路由配置
    frontend_base_path: str = Field(
        default="/",
        description="前端应用基础路径（用于登录成功/失败后的重定向）"
    )


@lru_cache
def get_settings() -> Settings:
    """
    获取缓存的配置实例。
    
    返回:
        Settings: 应用配置。
    """
    return Settings()
