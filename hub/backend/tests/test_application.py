"""
Application Tests

Unit tests and integration tests for application management functionality.
"""
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from src.main import create_app
from src.infrastructure.config.settings import Settings
from src.domains.application import Application
from src.application.application_service import ApplicationService
from src.adapters.application_adapter import ApplicationAdapter


@pytest.fixture
def test_settings() -> Settings:
    """
    创建测试配置。

    返回:
        Settings: 测试用的应用配置。
    """
    return Settings(
        app_name="DIP Hub Test",
        app_version="1.0.0-test",
        debug=True,
        host="127.0.0.1",
        port=8080,
        db_host="localhost",
        db_port=3306,
        db_name="dip_test",
        db_user="root",
        db_password="123456",
    )


@pytest.fixture
def sample_application() -> Application:
    """
    创建示例应用实体。

    返回:
        Application: 示例应用
    """
    return Application(
        id=1,
        key="test-app-001",
        name="测试应用",
        description="这是一个测试应用",
        icon="dGVzdC1pY29uLWRhdGE=",  # Base64 编码的 "test-icon-data"
        version="1.0.0",
        category="测试分类",
        config={
            "ontologies": [{"id": "onto-001"}, {"id": "onto-002"}],
            "agents": [{"id": "agent-001"}],
        },
        updated_by="user-001",
        updated_at=datetime(2024, 1, 1, 12, 0, 0),
    )


@pytest.fixture
def sample_application_no_config() -> Application:
    """
    创建没有配置的示例应用实体。

    返回:
        Application: 示例应用
    """
    return Application(
        id=2,
        key="test-app-002",
        name="测试应用2",
        description="没有配置的应用",
        icon=None,
        version="1.0.0",
        category=None,
        config=None,
        updated_by="user-001",
        updated_at=datetime(2024, 1, 1, 12, 0, 0),
    )


class TestApplicationDomain:
    """应用领域模型测试。"""

    def test_has_icon_returns_true_when_icon_exists(self, sample_application: Application):
        """测试当图标存在时 has_icon 返回 True。"""
        assert sample_application.has_icon() is True

    def test_has_icon_returns_false_when_icon_is_none(self, sample_application_no_config: Application):
        """测试当图标为 None 时 has_icon 返回 False。"""
        assert sample_application_no_config.has_icon() is False

    def test_has_icon_returns_false_when_icon_is_empty(self):
        """测试当图标为空时 has_icon 返回 False。"""
        app = Application(
            id=1,
            key="test",
            name="test",
            icon="",
            updated_by="user-001",
        )
        assert app.has_icon() is False

    def test_has_config_returns_true_when_config_exists(self, sample_application: Application):
        """测试当配置存在时 has_config 返回 True。"""
        assert sample_application.has_config() is True

    def test_has_config_returns_false_when_config_is_none(self, sample_application_no_config: Application):
        """测试当配置为 None 时 has_config 返回 False。"""
        assert sample_application_no_config.has_config() is False

    def test_has_config_returns_false_when_config_is_empty(self):
        """测试当配置为空字典时 has_config 返回 False。"""
        app = Application(
            id=1,
            key="test",
            name="test",
            config={},
            updated_by="user-001",
        )
        assert app.has_config() is False

    def test_get_ontology_ids_returns_ids_when_config_exists(self, sample_application: Application):
        """测试当配置存在时获取业务知识网络 ID 列表。"""
        ids = sample_application.get_ontology_ids()
        assert ids == ["onto-001", "onto-002"]

    def test_get_ontology_ids_returns_empty_list_when_no_config(self, sample_application_no_config: Application):
        """测试当没有配置时获取业务知识网络 ID 列表返回空列表。"""
        ids = sample_application_no_config.get_ontology_ids()
        assert ids == []

    def test_get_ontology_ids_returns_empty_list_when_no_ontologies(self):
        """测试当配置中没有 ontologies 时返回空列表。"""
        app = Application(
            id=1,
            key="test",
            name="test",
            config={"agents": []},
            updated_by="user-001",
        )
        ids = app.get_ontology_ids()
        assert ids == []

    def test_get_agent_ids_returns_ids_when_config_exists(self, sample_application: Application):
        """测试当配置存在时获取智能体 ID 列表。"""
        ids = sample_application.get_agent_ids()
        assert ids == ["agent-001"]

    def test_get_agent_ids_returns_empty_list_when_no_config(self, sample_application_no_config: Application):
        """测试当没有配置时获取智能体 ID 列表返回空列表。"""
        ids = sample_application_no_config.get_agent_ids()
        assert ids == []

    def test_get_agent_ids_returns_empty_list_when_no_agents(self):
        """测试当配置中没有 agents 时返回空列表。"""
        app = Application(
            id=1,
            key="test",
            name="test",
            config={"ontologies": []},
            updated_by="user-001",
        )
        ids = app.get_agent_ids()
        assert ids == []


class TestApplicationService:
    """应用服务测试。"""

    @pytest.mark.asyncio
    async def test_get_all_applications_calls_port(self, sample_application: Application):
        """测试 get_all_applications 调用端口的方法。"""
        # 创建 mock 端口
        mock_port = AsyncMock()
        mock_port.get_all_applications.return_value = [sample_application]

        # 创建服务
        service = ApplicationService(mock_port)

        # 调用方法
        result = await service.get_all_applications()

        # 验证
        mock_port.get_all_applications.assert_called_once()
        assert result == [sample_application]

    @pytest.mark.asyncio
    async def test_get_application_by_key_calls_port(self, sample_application: Application):
        """测试 get_application_by_key 调用端口的方法。"""
        # 创建 mock 端口
        mock_port = AsyncMock()
        mock_port.get_application_by_key.return_value = sample_application

        # 创建服务
        service = ApplicationService(mock_port)

        # 调用方法
        result = await service.get_application_by_key("test-app-001")

        # 验证
        mock_port.get_application_by_key.assert_called_once_with("test-app-001")
        assert result == sample_application

    @pytest.mark.asyncio
    async def test_delete_application_calls_port(self):
        """测试 delete_application 调用端口的方法。"""
        # 创建 mock 端口
        mock_port = AsyncMock()
        mock_port.delete_application.return_value = True

        # 创建服务
        service = ApplicationService(mock_port)

        # 调用方法
        result = await service.delete_application("test-app-001")

        # 验证
        mock_port.delete_application.assert_called_once_with("test-app-001")
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_application_raises_value_error_when_not_found(self):
        """测试当应用不存在时 delete_application 抛出 ValueError。"""
        # 创建 mock 端口
        mock_port = AsyncMock()
        mock_port.delete_application.side_effect = ValueError("应用不存在: nonexistent-key")

        # 创建服务
        service = ApplicationService(mock_port)

        # 调用方法并验证异常
        with pytest.raises(ValueError, match="应用不存在: nonexistent-key"):
            await service.delete_application("nonexistent-key")


class TestApplicationAdapter:
    """应用适配器测试。"""

    @pytest.mark.asyncio
    async def test_row_to_application_converts_correctly(self, test_settings: Settings):
        """测试数据库行转换为应用模型。"""
        adapter = ApplicationAdapter(test_settings)

        row = (
            1,
            "test-app-001",
            "测试应用",
            "这是一个测试应用",
            b"test-icon",
            "1.0.0",
            '{"ontologies": [{"id": "onto-001"}]}',
            "user-001",
            datetime(2024, 1, 1, 12, 0, 0),
        )

        app = adapter._row_to_application(row)

        assert app.id == 1
        assert app.key == "test-app-001"
        assert app.name == "测试应用"
        assert app.description == "这是一个测试应用"
        assert app.icon == "dGVzdC1pY29u"  # Base64 编码后的 "test-icon"
        assert app.version == "1.0.0"
        assert app.category is None
        assert app.config == {"ontologies": [{"id": "onto-001"}]}
        assert app.updated_by == "user-001"
        assert app.updated_at == datetime(2024, 1, 1, 12, 0, 0)

    @pytest.mark.asyncio
    async def test_row_to_application_handles_null_config(self, test_settings: Settings):
        """测试处理 NULL 配置。"""
        adapter = ApplicationAdapter(test_settings)

        row = (
            1,
            "test-app-001",
            "测试应用",
            None,
            None,
            None,
            None,
            "user-001",
            datetime(2024, 1, 1, 12, 0, 0),
        )

        app = adapter._row_to_application(row)

        assert app.config is None
        assert app.description is None
        assert app.icon is None
        assert app.version is None

    @pytest.mark.asyncio
    async def test_row_to_application_handles_invalid_json(self, test_settings: Settings):
        """测试处理无效 JSON 配置。"""
        adapter = ApplicationAdapter(test_settings)

        row = (
            1,
            "test-app-001",
            "测试应用",
            None,
            None,
            None,
            "{invalid-json}",
            "user-001",
            datetime(2024, 1, 1, 12, 0, 0),
        )

        with patch('src.adapters.application_adapter.logger') as mock_logger:
            app = adapter._row_to_application(row)
            assert app.config is None
            mock_logger.warning.assert_called_once()


class TestApplicationRouter:
    """应用路由测试。"""

    def test_get_applications_endpoint_returns_200(self, test_settings: Settings):
        """测试获取应用列表接口返回 200 状态码。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.get_all_applications') as mock_get_all:
            mock_get_all.return_value = []

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.get(f"{test_settings.api_prefix}/applications")

            assert response.status_code == 200

    def test_get_applications_endpoint_returns_array(self, test_settings: Settings):
        """测试获取应用列表接口返回数组格式。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.get_all_applications') as mock_get_all:
            mock_get_all.return_value = []

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.get(f"{test_settings.api_prefix}/applications")

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 0

    def test_get_application_by_key_endpoint_returns_404_when_not_found(self, test_settings: Settings):
        """测试当应用不存在时获取应用接口返回 404 状态码。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.get_application_by_key') as mock_get_by_key:
            mock_get_by_key.side_effect = ValueError("应用不存在: nonexistent-key")

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.get(f"{test_settings.api_prefix}/applications/nonexistent-key")

            assert response.status_code == 404

    def test_delete_application_endpoint_returns_204_when_successful(self, test_settings: Settings):
        """测试删除应用成功时接口返回 204 状态码。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.delete_application') as mock_delete:
            mock_delete.return_value = True

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.delete(f"{test_settings.api_prefix}/applications/test-app-001")

            assert response.status_code == 204
            mock_delete.assert_called_once_with("test-app-001")

    def test_delete_application_endpoint_returns_404_when_not_found(self, test_settings: Settings):
        """测试当应用不存在时删除应用接口返回 404 状态码。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.delete_application') as mock_delete:
            mock_delete.side_effect = ValueError("应用不存在: nonexistent-key")

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.delete(f"{test_settings.api_prefix}/applications/nonexistent-key")

            assert response.status_code == 404
            assert "应用不存在" in response.json()["detail"]

    def test_delete_application_endpoint_returns_500_on_error(self, test_settings: Settings):
        """测试删除应用时发生异常接口返回 500 状态码。"""
        with patch('src.adapters.application_adapter.ApplicationAdapter.delete_application') as mock_delete:
            mock_delete.side_effect = Exception("数据库连接失败")

            app = create_app(test_settings)
            client = TestClient(app)

            response = client.delete(f"{test_settings.api_prefix}/applications/test-app-001")

            assert response.status_code == 500
            assert "删除应用失败" in response.json()["detail"]
