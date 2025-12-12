# DIP Hub Backend

DIP Hub 后端服务，基于 Flask 框架，采用六边形架构设计。

## 架构说明

本项目采用六边形架构（Hexagonal Architecture），也称为端口与适配器架构（Ports and Adapters）：

```
src/dip_hub/
├── domain/          # 领域层：核心业务逻辑和领域模型
│   └── health/
│       ├── models.py    # 领域模型
│       └── ports.py     # 端口定义（接口）
├── application/     # 应用层：用例和业务编排
│   └── health_service.py
├── adapters/        # 适配器层
│   ├── inbound/     # 入站适配器（驱动侧）
│   │   └── http/    # HTTP API 控制器
│   └── outbound/    # 出站适配器（被驱动侧）
│       └── health_checker.py
├── app.py           # Flask 应用工厂
└── config.py        # 配置管理
```

## 环境要求

- Python 3.10+
- pip

## 安装

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate   # Windows

# 安装依赖
pip install -e ".[dev]"
```

## 运行

```bash
# 开发模式
flask --app src/dip_hub/app:create_app run --debug

# 或使用环境变量
export FLASK_APP=src/dip_hub/app:create_app
export FLASK_ENV=development
flask run
```

## 测试

```bash
# 运行所有测试
pytest

# 运行并生成覆盖率报告
pytest --cov=src/dip_hub --cov-report=html

# 只运行单元测试
pytest tests/unit/

# 只运行集成测试
pytest tests/integration/
```

## API 端点

### 健康检查

- `GET /api/internal/dip-hub/v1/healthz` - 通用健康检查
- `GET /api/internal/dip-hub/v1/readyz` - 就绪检查
