"""Unit tests for health checker adapters."""

import pytest

from dip_hub.adapters.outbound.health_checker import (
    ApplicationHealthChecker,
    DatabaseHealthChecker,
)
from dip_hub.domain.health.models import HealthStatusEnum


class TestApplicationHealthChecker:
    """Tests for ApplicationHealthChecker."""

    def test_name(self) -> None:
        """Test name property."""
        checker = ApplicationHealthChecker()
        assert checker.name == "application"

    def test_check_returns_healthy(self) -> None:
        """Test check returns healthy status."""
        checker = ApplicationHealthChecker()
        result = checker.check()

        assert result.name == "application"
        assert result.status == HealthStatusEnum.UP
        assert result.detail == "Application is running"


class TestDatabaseHealthChecker:
    """Tests for DatabaseHealthChecker."""

    def test_name(self) -> None:
        """Test name property."""
        checker = DatabaseHealthChecker()
        assert checker.name == "database"

    def test_check_without_connection_string(self) -> None:
        """Test check without connection string."""
        checker = DatabaseHealthChecker()
        result = checker.check()

        assert result.name == "database"
        assert result.status == HealthStatusEnum.UP
        assert "not configured" in result.detail.lower()

    def test_check_with_connection_string(self) -> None:
        """Test check with connection string."""
        checker = DatabaseHealthChecker(connection_string="postgresql://localhost/test")
        result = checker.check()

        assert result.name == "database"
        assert result.status == HealthStatusEnum.UP
        # Currently returns OK as it's a placeholder
        assert "OK" in result.detail
