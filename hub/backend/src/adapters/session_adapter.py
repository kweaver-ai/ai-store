"""
Session 适配器

实现 SessionPort 接口的 Redis 适配器。
负责与 Redis 交互，完成 Session 数据的存储操作。
"""
import json
import logging
from typing import Optional

try:
    import redis.asyncio as redis
except ImportError:
    # 兼容旧版本的 redis 库
    import aioredis as redis

from src.domains.session import SessionInfo
from src.ports.session_port import SessionPort
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class SessionAdapter(SessionPort):
    """
    Session Redis 适配器实现。

    该适配器实现了 SessionPort 接口，提供 Session 数据的 Redis 访问操作。
    使用 redis.asyncio 进行异步 Redis 操作。
    """

    def __init__(self, settings: Settings):
        """
        初始化 Session 适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._redis_client: Optional[redis.Redis] = None
        self._parse_redis_host()

    def _parse_redis_host(self):
        """解析 Redis 主机地址"""
        host_port = self._settings.redis_host.split(":")
        self._redis_host = host_port[0]
        self._redis_port = int(host_port[1]) if len(host_port) > 1 else 6379

    async def _get_client(self) -> redis.Redis:
        """
        获取 Redis 客户端。

        返回:
            redis.Redis: Redis 客户端
        """
        if self._redis_client is None:
            self._redis_client = await redis.Redis(
                host=self._redis_host,
                port=self._redis_port,
                password=self._settings.redis_password,
                db=self._settings.redis_db,
                decode_responses=True,
            )
            logger.info(f"Redis 客户端已创建: {self._redis_host}:{self._redis_port}/{self._settings.redis_db}")
        return self._redis_client

    async def get_session(self, session_id: str) -> Optional[SessionInfo]:
        """
        获取 Session 信息。

        参数:
            session_id: Session ID

        返回:
            Optional[SessionInfo]: Session 信息，如果不存在则返回 None
        """
        try:
            client = await self._get_client()
            data = await client.get(f"session:{session_id}")
            if data is None:
                return None
            
            session_dict = json.loads(data)
            return SessionInfo(
                state=session_dict.get("state", ""),
                platform=session_dict.get("platform", 1),
                as_redirect=session_dict.get("as_redirect"),
                token=session_dict.get("token"),
                refresh_token=session_dict.get("refresh_token"),
                id_token=session_dict.get("id_token"),
                userid=session_dict.get("userid"),
                username=session_dict.get("username"),
                vision_name=session_dict.get("vision_name"),
                visitor_typ=session_dict.get("visitor_typ"),
                sso=session_dict.get("sso"),
            )
        except Exception as e:
            logger.error(f"获取 Session 失败: {e}", exc_info=True)
            raise

    async def save_session(self, session_id: str, session_info: SessionInfo) -> None:
        """
        保存 Session 信息。

        参数:
            session_id: Session ID
            session_info: Session 信息
        """
        try:
            client = await self._get_client()
            session_dict = {
                "state": session_info.state,
                "platform": session_info.platform,
                "as_redirect": session_info.as_redirect,
                "token": session_info.token,
                "refresh_token": session_info.refresh_token,
                "id_token": session_info.id_token,
                "userid": session_info.userid,
                "username": session_info.username,
                "vision_name": session_info.vision_name,
                "visitor_typ": session_info.visitor_typ,
                "sso": session_info.sso,
            }
            # 移除 None 值
            session_dict = {k: v for k, v in session_dict.items() if v is not None}
            
            data = json.dumps(session_dict)
            # 设置过期时间为 cookie_timeout
            await client.setex(
                f"session:{session_id}",
                self._settings.cookie_timeout,
                data
            )
            logger.debug(f"Session 已保存: {session_id}")
        except Exception as e:
            logger.error(f"保存 Session 失败: {e}", exc_info=True)
            raise

    async def delete_session(self, session_id: str) -> None:
        """
        删除 Session 信息。

        参数:
            session_id: Session ID
        """
        try:
            client = await self._get_client()
            await client.delete(f"session:{session_id}")
            logger.debug(f"Session 已删除: {session_id}")
        except Exception as e:
            logger.error(f"删除 Session 失败: {e}", exc_info=True)
            raise

    async def close(self):
        """关闭 Redis 客户端连接。"""
        if self._redis_client is not None:
            await self._redis_client.close()
            self._redis_client = None
            logger.info("Redis 客户端连接已关闭")

