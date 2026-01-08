"""
数据库初始化模块

在服务启动时自动检测并创建所需的数据库表。
"""
import logging
from typing import Optional

import aiomysql

from src.infrastructure.config.settings import Settings

logger = logging.getLogger(__name__)


async def ensure_tables_exist(settings: Settings) -> None:
    """
    确保所有必需的数据库表存在，如果不存在则创建。
    
    参数:
        settings: 应用配置
    """
    connection: Optional[aiomysql.Connection] = None
    try:
        # 连接到数据库
        connection = await aiomysql.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            db=settings.db_name,
            charset='utf8mb4',
        )
        
        async with connection.cursor() as cursor:
            # 检查并创建用户表
            await _ensure_table_exists(
                cursor,
                settings.db_name,
                "t_user",
                """
                CREATE TABLE IF NOT EXISTS `t_user` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
                    `display_name` VARCHAR(255) NOT NULL COMMENT '用户显示名',
                    PRIMARY KEY (`id`),
                    INDEX `idx_user_id` (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
                """
            )
            
            # 检查并创建角色表
            await _ensure_table_exists(
                cursor,
                settings.db_name,
                "t_role",
                """
                CREATE TABLE IF NOT EXISTS `t_role` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
                    `role_name` VARCHAR(255) NOT NULL COMMENT '角色名称',
                    PRIMARY KEY (`id`),
                    INDEX `idx_role_id` (`role_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表'
                """
            )
            
            # 检查并创建用户-角色关系表
            await _ensure_table_exists(
                cursor,
                settings.db_name,
                "t_user_role",
                """
                CREATE TABLE IF NOT EXISTS `t_user_role` (
                    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
                    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
                    PRIMARY KEY (`user_id`, `role_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关系表'
                """
            )
            
            # 检查并创建应用表
            await _ensure_table_exists(
                cursor,
                settings.db_name,
                "t_application",
                """
                CREATE TABLE IF NOT EXISTS `t_application` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `key` CHAR(32) NOT NULL COMMENT '应用包唯一标识',
                    `name` VARCHAR(128) NOT NULL COMMENT '应用名称',
                    `description` VARCHAR(800) NULL COMMENT '应用描述',
                    `icon` BLOB NULL COMMENT '应用图标（二进制数据）',
                    `version` VARCHAR(128) NULL COMMENT '当前上传的版本号',
                    `category` VARCHAR(128) NULL COMMENT '应用所属分组',
                    `business_domain` VARCHAR(128) NULL DEFAULT 'db_public' COMMENT '业务域',
                    `micro_app` TEXT NULL COMMENT '微应用配置（JSON对象）',
                    `release_config` TEXT NULL COMMENT '应用安装配置（JSON数组，helm release名称列表）',
                    `ontology_ids` TEXT NULL COMMENT '业务知识网络配置（JSON数组，每个元素包含id和is_config字段）',
                    `agent_ids` TEXT NULL COMMENT '智能体配置（JSON数组，每个元素包含id和is_config字段）',
                    `is_config` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成配置',
                    `updated_by` VARCHAR(128) NOT NULL COMMENT '更新者用户显示名称',
                    `updated_by_id` CHAR(36) NULL COMMENT '更新者用户ID',
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                    PRIMARY KEY (`id`),
                    UNIQUE INDEX `idx_key` (`key`),
                    INDEX `idx_updated_by` (`updated_by`),
                    INDEX `idx_updated_at` (`updated_at`),
                    INDEX `idx_category` (`category`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用表'
                """
            )
            
            # 检查并添加 business_domain 字段（如果表已存在但字段不存在）
            await _ensure_column_exists(
                cursor,
                settings.db_name,
                "t_application",
                "business_domain",
                "ALTER TABLE `t_application` ADD COLUMN `business_domain` VARCHAR(128) NULL DEFAULT 'db_public' COMMENT '业务域' AFTER `category`"
            )
            
            # 检查并添加 updated_by_id 字段（如果表已存在但字段不存在）
            await _ensure_column_exists(
                cursor,
                settings.db_name,
                "t_application",
                "updated_by_id",
                "ALTER TABLE `t_application` ADD COLUMN `updated_by_id` CHAR(36) NULL COMMENT '更新者用户ID' AFTER `updated_by`"
            )
            
            # 修改 updated_by 字段类型（如果表已存在且字段类型为 CHAR(36)）
            await _ensure_column_type_updated(
                cursor,
                settings.db_name,
                "t_application",
                "updated_by",
                "ALTER TABLE `t_application` MODIFY COLUMN `updated_by` VARCHAR(128) NOT NULL COMMENT '更新者用户显示名称'"
            )
        
        await connection.commit()
        logger.info("数据库表检查完成")
        
    except Exception as e:
        logger.error(f"数据库表初始化失败: {e}", exc_info=True)
        if connection:
            await connection.rollback()
        raise
    finally:
        if connection:
            connection.close()


async def _ensure_table_exists(
    cursor: aiomysql.Cursor,
    db_name: str,
    table_name: str,
    create_sql: str,
) -> None:
    """
    确保表存在，如果不存在则创建。
    
    参数:
        cursor: 数据库游标
        db_name: 数据库名称
        table_name: 表名
        create_sql: 创建表的 SQL 语句
    """
    try:
        # 检查表是否存在
        await cursor.execute(
            """
            SELECT COUNT(*) as cnt 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
            """,
            (db_name, table_name)
        )
        result = await cursor.fetchone()
        
        # fetchone() 返回元组，第一个元素是计数
        count = result[0] if result else 0
        
        if count == 0:
            # 表不存在，创建表
            await cursor.execute(create_sql)
            logger.info(f"✓ 表 '{table_name}' 已创建")
        else:
            logger.debug(f"○ 表 '{table_name}' 已存在")
    except Exception as e:
        logger.error(f"检查/创建表 '{table_name}' 失败: {e}", exc_info=True)
        raise


async def _ensure_column_exists(
    cursor: aiomysql.Cursor,
    db_name: str,
    table_name: str,
    column_name: str,
    alter_sql: str,
) -> None:
    """
    确保列存在，如果不存在则添加。
    
    参数:
        cursor: 数据库游标
        db_name: 数据库名称
        table_name: 表名
        column_name: 列名
        alter_sql: 添加列的 SQL 语句
    """
    try:
        # 检查列是否存在
        await cursor.execute(
            """
            SELECT COUNT(*) as cnt 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = %s 
            AND COLUMN_NAME = %s
            """,
            (db_name, table_name, column_name)
        )
        result = await cursor.fetchone()
        
        # fetchone() 返回元组，第一个元素是计数
        count = result[0] if result else 0
        
        if count == 0:
            # 列不存在，添加列
            await cursor.execute(alter_sql)
            logger.info(f"✓ 表 '{table_name}' 的列 '{column_name}' 已添加")
        else:
            logger.debug(f"○ 表 '{table_name}' 的列 '{column_name}' 已存在")
    except Exception as e:
        logger.warning(f"检查/添加列 '{table_name}.{column_name}' 失败: {e}")
        # 不抛出异常，因为列可能已经存在或表结构不同


async def _ensure_column_type_updated(
    cursor: aiomysql.Cursor,
    db_name: str,
    table_name: str,
    column_name: str,
    alter_sql: str,
) -> None:
    """
    确保列的类型已更新。
    
    参数:
        cursor: 数据库游标
        db_name: 数据库名称
        table_name: 表名
        column_name: 列名
        alter_sql: 修改列的 SQL 语句
    """
    try:
        # 检查列是否存在
        await cursor.execute(
            """
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = %s 
            AND COLUMN_NAME = %s
            """,
            (db_name, table_name, column_name)
        )
        result = await cursor.fetchone()
        
        if result:
            # 列存在，检查类型是否需要更新
            current_type = result[0].upper()
            # 如果当前类型是 CHAR(36)，则更新为 VARCHAR(128)
            if 'CHAR(36)' in current_type:
                await cursor.execute(alter_sql)
                logger.info(f"✓ 表 '{table_name}' 的列 '{column_name}' 类型已更新")
            else:
                logger.debug(f"○ 表 '{table_name}' 的列 '{column_name}' 类型已正确")
        else:
            logger.debug(f"○ 表 '{table_name}' 的列 '{column_name}' 不存在，跳过类型更新")
    except Exception as e:
        logger.warning(f"检查/更新列类型 '{table_name}.{column_name}' 失败: {e}")
        # 不抛出异常，因为列可能已经存在或表结构不同

