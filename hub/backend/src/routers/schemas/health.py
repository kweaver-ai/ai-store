"""
健康检查 API 数据模型

健康检查 API 请求和响应的 Pydantic 模型。
"""
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    """健康检查端点的响应模型。"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "message": "服务运行正常",
                "version": "1.0.0"
            }
        }
    )

    status: str = Field(..., description="健康状态（healthy, unhealthy, degraded）")
    message: str = Field(..., description="健康状态消息")
    version: Optional[str] = Field(None, description="服务版本")


class ReadyResponse(BaseModel):
    """就绪检查端点的响应模型。"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ready",
                "message": "服务已准备好接受请求",
                "checks": {
                    "uptime_seconds": 120.5,
                    "dependencies": "ok"
                }
            }
        }
    )

    status: str = Field(..., description="就绪状态（ready, not_ready）")
    message: str = Field(..., description="就绪状态消息")
    checks: Optional[Dict[str, Any]] = Field(None, description="详细检查结果")


class ServiceInfoResponse(BaseModel):
    """服务信息端点的响应模型。"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "DIP Hub",
                "version": "1.0.0",
                "uptime_seconds": 120.5
            }
        }
    )

    name: str = Field(..., description="服务名称")
    version: str = Field(..., description="服务版本")
    uptime_seconds: float = Field(..., description="服务运行时间（秒）")
