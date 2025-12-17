"""
应用适配器

实现 ApplicationPort 接口的数据库适配器。
负责与 MariaDB 数据库交互，完成应用数据的持久化操作。
"""
import base64
import json
import logging
from typing import List, Optional
from datetime import datetime

import aiomysql

from src.domains.application import Application
from src.ports.application_port import ApplicationPort
from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


class ApplicationAdapter(ApplicationPort):
    """
    应用数据库适配器实现。

    该适配器实现了 ApplicationPort 接口，提供应用数据的数据库访问操作。
    使用 aiomysql 进行异步数据库操作。
    """

    def __init__(self, settings: Settings):
        """
        初始化应用适配器。

        参数:
            settings: 应用配置
        """
        self._settings = settings
        self._pool: Optional[aiomysql.Pool] = None

    async def _get_pool(self) -> aiomysql.Pool:
        """
        获取数据库连接池。

        返回:
            aiomysql.Pool: 数据库连接池
        """
        if self._pool is None:
            self._pool = await aiomysql.create_pool(
                host=self._settings.db_host,
                port=self._settings.db_port,
                user=self._settings.db_user,
                password=self._settings.db_password,
                db=self._settings.db_name,
                autocommit=True,
                minsize=1,
                maxsize=10,
            )
            logger.info(f"数据库连接池已创建: {self._settings.db_host}:{self._settings.db_port}/{self._settings.db_name}")
        return self._pool

    async def close(self):
        """关闭数据库连接池。"""
        if self._pool is not None:
            self._pool.close()
            await self._pool.wait_closed()
            logger.info("数据库连接池已关闭")

    def _parse_json_list(self, json_str: Optional[str], default: list = None) -> list:
        """
        解析 JSON 字符串为列表。

        参数:
            json_str: JSON 字符串
            default: 默认值

        返回:
            list: 解析后的列表
        """
        if default is None:
            default = []
        if not json_str:
            return default
        try:
            result = json.loads(json_str)
            return result if isinstance(result, list) else default
        except json.JSONDecodeError:
            logger.warning(f"JSON 解析失败: {json_str}")
            return default

    def _row_to_application(self, row: tuple) -> Application:
        """
        将数据库行转换为应用领域模型。

        参数:
            row: 数据库查询结果行
                (id, key, name, description, icon, version, category, 
                 release_config, ontology_ids, agent_ids, is_config, updated_by, updated_at)

        返回:
            Application: 应用领域模型
        """
        # 将二进制图标转换为 Base64 字符串
        icon_base64 = None
        if row[4]:
            try:
                icon_base64 = base64.b64encode(row[4]).decode('utf-8')
            except Exception as e:
                logger.warning(f"应用图标 Base64 编码失败: {e}")
                icon_base64 = None

        # 解析 JSON 字段
        release_config = self._parse_json_list(row[7])
        ontology_ids = self._parse_json_list(row[8])
        agent_ids = self._parse_json_list(row[9])

        return Application(
            id=row[0],
            key=row[1],
            name=row[2],
            description=row[3],
            icon=icon_base64,
            version=row[5],
            category=row[6],
            release_config=release_config,
            ontology_ids=ontology_ids,
            agent_ids=agent_ids,
            is_config=bool(row[10]) if row[10] is not None else False,
            updated_by=row[11] or "",
            updated_at=row[12],
        )

    async def get_all_applications(self) -> List[Application]:
        """
        获取所有已安装的应用列表。

        返回:
            List[Application]: 应用列表
        """
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """SELECT id, `key`, name, description, icon, version, category,
                              release_config, ontology_ids, agent_ids, is_config, 
                              updated_by, updated_at 
                       FROM t_application 
                       ORDER BY updated_at DESC"""
                )
                rows = await cursor.fetchall()
                return [self._row_to_application(row) for row in rows]

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
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """SELECT id, `key`, name, description, icon, version, category,
                              release_config, ontology_ids, agent_ids, is_config,
                              updated_by, updated_at 
                       FROM t_application 
                       WHERE `key` = %s""",
                    (key,)
                )
                row = await cursor.fetchone()
                if row is None:
                    raise ValueError(f"应用不存在: {key}")
                return self._row_to_application(row)

    async def get_application_by_key_optional(self, key: str) -> Optional[Application]:
        """
        根据应用唯一标识获取应用信息（可选）。

        参数:
            key: 应用包唯一标识

        返回:
            Optional[Application]: 应用实体，不存在时返回 None
        """
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """SELECT id, `key`, name, description, icon, version, category,
                              release_config, ontology_ids, agent_ids, is_config,
                              updated_by, updated_at 
                       FROM t_application 
                       WHERE `key` = %s""",
                    (key,)
                )
                row = await cursor.fetchone()
                if row is None:
                    return None
                return self._row_to_application(row)

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
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 检查应用是否已存在
                await cursor.execute(
                    "SELECT COUNT(*) FROM t_application WHERE `key` = %s",
                    (application.key,)
                )
                count = (await cursor.fetchone())[0]
                if count > 0:
                    raise ValueError(f"应用已存在: {application.key}")

                # 将 Base64 字符串转换为二进制数据
                icon_binary = None
                if application.icon:
                    try:
                        icon_binary = base64.b64decode(application.icon)
                    except Exception as e:
                        logger.warning(f"应用图标 Base64 解码失败: {e}")
                        icon_binary = None

                # 序列化 JSON 字段
                release_config_json = json.dumps(application.release_config) if application.release_config else "[]"
                ontology_ids_json = json.dumps(application.ontology_ids) if application.ontology_ids else "[]"
                agent_ids_json = json.dumps(application.agent_ids) if application.agent_ids else "[]"

                # 插入新应用
                await cursor.execute(
                    """INSERT INTO t_application 
                       (`key`, name, description, icon, version, category,
                        release_config, ontology_ids, agent_ids, is_config,
                        updated_by, updated_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        application.key,
                        application.name,
                        application.description,
                        icon_binary,
                        application.version,
                        application.category,
                        release_config_json,
                        ontology_ids_json,
                        agent_ids_json,
                        application.is_config,
                        application.updated_by,
                        application.updated_at or datetime.now(),
                    )
                )

                # 获取插入的 ID
                application.id = cursor.lastrowid
                return application

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
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 将 Base64 字符串转换为二进制数据
                icon_binary = None
                if application.icon:
                    try:
                        icon_binary = base64.b64decode(application.icon)
                    except Exception as e:
                        logger.warning(f"应用图标 Base64 解码失败: {e}")
                        icon_binary = None

                # 序列化 JSON 字段
                release_config_json = json.dumps(application.release_config) if application.release_config else "[]"
                ontology_ids_json = json.dumps(application.ontology_ids) if application.ontology_ids else "[]"
                agent_ids_json = json.dumps(application.agent_ids) if application.agent_ids else "[]"

                await cursor.execute(
                    """UPDATE t_application 
                       SET name = %s, description = %s, icon = %s, version = %s, category = %s,
                           release_config = %s, ontology_ids = %s, agent_ids = %s, is_config = %s,
                           updated_by = %s, updated_at = %s 
                       WHERE `key` = %s""",
                    (
                        application.name,
                        application.description,
                        icon_binary,
                        application.version,
                        application.category,
                        release_config_json,
                        ontology_ids_json,
                        agent_ids_json,
                        application.is_config,
                        application.updated_by,
                        application.updated_at or datetime.now(),
                        application.key,
                    )
                )

                if cursor.rowcount == 0:
                    raise ValueError(f"应用不存在: {application.key}")

                return application

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
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                ontology_ids_json = json.dumps(ontology_ids)
                agent_ids_json = json.dumps(agent_ids)
                is_config = True  # 配置后标记为已配置

                await cursor.execute(
                    """UPDATE t_application 
                       SET ontology_ids = %s, agent_ids = %s, is_config = %s,
                           updated_by = %s, updated_at = %s 
                       WHERE `key` = %s""",
                    (
                        ontology_ids_json,
                        agent_ids_json,
                        is_config,
                        updated_by,
                        datetime.now(),
                        key,
                    )
                )

                if cursor.rowcount == 0:
                    raise ValueError(f"应用不存在: {key}")

                # 返回更新后的应用
                return await self.get_application_by_key(key)

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
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM t_application WHERE `key` = %s",
                    (key,)
                )

                if cursor.rowcount == 0:
                    raise ValueError(f"应用不存在: {key}")

                return True
