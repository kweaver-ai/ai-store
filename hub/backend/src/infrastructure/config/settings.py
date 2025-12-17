"""
应用配置管理

使用 pydantic-settings 进行配置管理。
配置可以通过环境变量或 .env 文件进行设置。
"""
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # ADP 平台配置
    adp_url: str = Field(default="http://localhost:8081", description="ADP 服务地址")
    adp_timeout: int = Field(default=60, description="ADP 请求超时时间（秒）")

    # Mock 模式配置
    use_mock_services: bool = Field(
        default=False, 
        description="是否使用 Mock 外部服务（用于本地开发调试）"
    )


@lru_cache
def get_settings() -> Settings:
    """
    获取缓存的配置实例。
    
    返回:
        Settings: 应用配置。
    """
    return Settings()
