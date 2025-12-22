"""
数据库初始化脚本

创建 DIP Hub 所需的数据库表。
"""
import pymysql
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 数据库连接配置
DB_HOST = os.getenv('DIP_HUB_DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DIP_HUB_DB_PORT', '3306'))
DB_USER = os.getenv('DIP_HUB_DB_USER', 'root')
DB_PASSWORD = os.getenv('DIP_HUB_DB_PASSWORD', '123456')
DB_NAME = os.getenv('DIP_HUB_DB_NAME', 'dip')


def init_database():
    """初始化数据库和表。"""
    # 首先连接到 MySQL（不指定数据库）
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # 创建数据库（如果不存在）
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✓ 数据库 '{DB_NAME}' 已创建或已存在")

            # 使用该数据库
            cursor.execute(f"USE `{DB_NAME}`")

            # 创建用户表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `t_user` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
                    `display_name` VARCHAR(255) NOT NULL COMMENT '用户显示名',
                    PRIMARY KEY (`id`),
                    INDEX `idx_user_id` (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
            """)
            print("✓ 表 't_user' 已创建")

            # 创建角色表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `t_role` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
                    `role_name` VARCHAR(255) NOT NULL COMMENT '角色名称',
                    PRIMARY KEY (`id`),
                    INDEX `idx_role_id` (`role_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表'
            """)
            print("✓ 表 't_role' 已创建")

            # 创建用户-角色关系表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `t_user_role` (
                    `user_id` CHAR(36) NOT NULL COMMENT '用户ID',
                    `role_id` CHAR(36) NOT NULL COMMENT '角色ID',
                    PRIMARY KEY (`user_id`, `role_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关系表'
            """)
            print("✓ 表 't_user_role' 已创建")

            # 创建应用表（包含所有新字段）
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `t_application` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                    `key` CHAR(32) NOT NULL COMMENT '应用包唯一标识',
                    `name` VARCHAR(128) NOT NULL COMMENT '应用名称',
                    `description` VARCHAR(800) NULL COMMENT '应用描述',
                    `icon` BLOB NULL COMMENT '应用图标（二进制数据）',
                    `version` VARCHAR(128) NULL COMMENT '当前上传的版本号',
                    `category` VARCHAR(128) NULL COMMENT '应用所属分组',
                    `micro_app` TEXT NULL COMMENT '微应用配置（JSON对象）',
                    `release_config` TEXT NULL COMMENT '应用安装配置（JSON数组，helm release名称列表）',
                    `ontology_ids` TEXT NULL COMMENT '业务知识网络配置（JSON数组，每个元素包含id和is_config字段）',
                    `agent_ids` TEXT NULL COMMENT '智能体配置（JSON数组，每个元素包含id和is_config字段）',
                    `is_config` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成配置',
                    `updated_by` CHAR(36) NOT NULL COMMENT '更新者ID',
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                    PRIMARY KEY (`id`),
                    UNIQUE INDEX `idx_key` (`key`),
                    INDEX `idx_updated_by` (`updated_by`),
                    INDEX `idx_updated_at` (`updated_at`),
                    INDEX `idx_category` (`category`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用表'
            """)
            print("✓ 表 't_application' 已创建")

        connection.commit()
        print("\n✓ 数据库初始化完成！")

    except Exception as e:
        print(f"\n✗ 数据库初始化失败: {e}")
        connection.rollback()
        raise
    finally:
        connection.close()


def migrate_database():
    """迁移数据库（添加新字段到现有表）。"""
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # 检查并添加新字段
            migrations = [
                ("category", "ALTER TABLE `t_application` ADD COLUMN `category` VARCHAR(128) NULL COMMENT '应用所属分组' AFTER `version`"),
                ("micro_app", "ALTER TABLE `t_application` ADD COLUMN `micro_app` TEXT NULL COMMENT '微应用配置（JSON对象）' AFTER `category`"),
                ("release_config", "ALTER TABLE `t_application` ADD COLUMN `release_config` TEXT NULL COMMENT '应用安装配置（JSON数组，helm release名称列表）' AFTER `micro_app`"),
                ("ontology_ids", "ALTER TABLE `t_application` ADD COLUMN `ontology_ids` TEXT NULL COMMENT '业务知识网络ID列表（JSON数组）' AFTER `release_config`"),
                ("agent_ids", "ALTER TABLE `t_application` ADD COLUMN `agent_ids` TEXT NULL COMMENT '智能体ID列表（JSON数组）' AFTER `ontology_ids`"),
                ("is_config", "ALTER TABLE `t_application` ADD COLUMN `is_config` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成配置' AFTER `agent_ids`"),
            ]

            for column_name, sql in migrations:
                try:
                    # 检查列是否存在
                    cursor.execute(f"""
                        SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = '{DB_NAME}' 
                        AND TABLE_NAME = 't_application' 
                        AND COLUMN_NAME = '{column_name}'
                    """)
                    result = cursor.fetchone()
                    
                    if result['cnt'] == 0:
                        cursor.execute(sql)
                        print(f"✓ 已添加列 '{column_name}'")
                    else:
                        print(f"○ 列 '{column_name}' 已存在，跳过")
                except Exception as e:
                    print(f"✗ 添加列 '{column_name}' 失败: {e}")

            # 删除旧的 config 字段（如果存在且迁移完成）
            try:
                cursor.execute(f"""
                    SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = '{DB_NAME}' 
                    AND TABLE_NAME = 't_application' 
                    AND COLUMN_NAME = 'config'
                """)
                result = cursor.fetchone()
                
                if result['cnt'] > 0:
                    print("○ 旧 'config' 列仍存在，可在确认迁移成功后手动删除")
            except Exception:
                pass

        connection.commit()
        print("\n✓ 数据库迁移完成！")

    except Exception as e:
        print(f"\n✗ 数据库迁移失败: {e}")
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == '__main__':
    import sys
    
    print("DIP Hub 数据库初始化/迁移脚本")
    print(f"数据库主机: {DB_HOST}:{DB_PORT}")
    print(f"数据库名称: {DB_NAME}")
    print(f"数据库用户: {DB_USER}")
    print("-" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == 'migrate':
        print("执行数据库迁移...")
        migrate_database()
    else:
        print("执行数据库初始化...")
        init_database()
        print("\n提示: 如需迁移现有数据库，请运行: python init_db.py migrate")
