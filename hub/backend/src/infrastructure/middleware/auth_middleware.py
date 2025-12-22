"""
认证中间件

统一从请求头提取认证token并存储到request.state和TokenContext中，供后续处理使用。
"""
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from src.infrastructure.context.token_context import TokenContext

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    认证中间件。
    
    从请求头中提取Authorization token，并存储到：
    1. request.state.auth_token - 供路由层使用
    2. TokenContext - 供适配器层统一获取
    
    如果请求头中没有Authorization，则auth_token为None。
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        处理请求，提取认证token。
        
        参数:
            request: 请求对象
            call_next: 下一个中间件或路由处理函数
        
        返回:
            Response: HTTP响应
        """
        # 从请求头提取Authorization token
        auth_header = request.headers.get("Authorization")
        auth_token = auth_header if auth_header else None
        
        # 存储到request.state中，供路由层使用
        request.state.auth_token = auth_token
        
        # 存储到TokenContext中，供适配器层统一获取
        TokenContext.set_token(auth_token)
        
        try:
            # 继续处理请求
            response = await call_next(request)
            return response
        finally:
            # 请求处理完成后清除上下文，避免上下文污染
            TokenContext.clear_token()

