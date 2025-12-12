"""Unit tests for health domain models."""

from datetime import datetime, timezone

import pytest

from dip_hub.domain.health.models import (
    HealthCheckItem,
    HealthStatus,
    HealthStatusEnum,
)


class TestHealthStatusEnum:
    """Tests for HealthStatusEnum."""

    def test_enum_values(self) -> None:
        """Test enum values."""
        assert HealthStatusEnum.UP.value == "UP"
        assert HealthStatusEnum.DOWN.value == "DOWN"
        assert HealthStatusEnum.DEGRADED.value == "DEGRADED"


class TestHealthCheckItem:
    """Tests for HealthCheckItem."""

    def test_create_health_check_item(self) -> None:
        """Test creating a health check item."""
        item = HealthCheckItem(
            name="test",
            status=HealthStatusEnum.UP,
            detail="Test detail",
        )
        assert item.name == "test"
        assert item.status == HealthStatusEnum.UP
        assert item.detail == "Test detail"

    def test_create_health_check_item_without_detail(self) -> None:
        """Test creating a health check item without detail."""
        item = HealthCheckItem(
            name="test",
            status=HealthStatusEnum.UP,
        )
        assert item.name == "test"
        assert item.status == HealthStatusEnum.UP
        assert item.detail is None

    def test_to_dict_with_detail(self) -> None:
        """Test converting to dict with detail."""
        item = HealthCheckItem(
            name="test",
            status=HealthStatusEnum.UP,
            detail="Test detail",
        )
        result = item.to_dict()
        assert result == {
            "name": "test",
            "status": "UP",
            "detail": "Test detail",
        }

    def test_to_dict_without_detail(self) -> None:
        """Test converting to dict without detail."""
        item = HealthCheckItem(
            name="test",
            status=HealthStatusEnum.DOWN,
        )
        result = item.to_dict()
        assert result == {
            "name": "test",
            "status": "DOWN",
        }
        assert "detail" not in result


class TestHealthStatus:
    """Tests for HealthStatus."""

    def test_create_health_status(self) -> None:
        """Test creating a health status."""
        status = HealthStatus(status=HealthStatusEnum.UP)
        assert status.status == HealthStatusEnum.UP
        assert status.checks == []
        assert isinstance(status.timestamp, datetime)

    def test_create_health_status_with_checks(self) -> None:
        """Test creating a health status with checks."""
        checks = [
            HealthCheckItem(name="test1", status=HealthStatusEnum.UP),
            HealthCheckItem(name="test2", status=HealthStatusEnum.UP),
        ]
        status = HealthStatus(status=HealthStatusEnum.UP, checks=checks)
        assert len(status.checks) == 2

    def test_healthy_factory(self) -> None:
        """Test healthy factory method."""
        status = HealthStatus.healthy()
        assert status.status == HealthStatusEnum.UP
        assert status.is_healthy() is True

    def test_unhealthy_factory(self) -> None:
        """Test unhealthy factory method."""
        status = HealthStatus.unhealthy()
        assert status.status == HealthStatusEnum.DOWN
        assert status.is_healthy() is False

    def test_is_healthy_true(self) -> None:
        """Test is_healthy returns True for UP status."""
        status = HealthStatus(status=HealthStatusEnum.UP)
        assert status.is_healthy() is True

    def test_is_healthy_false(self) -> None:
        """Test is_healthy returns False for non-UP status."""
        status = HealthStatus(status=HealthStatusEnum.DOWN)
        assert status.is_healthy() is False

        status = HealthStatus(status=HealthStatusEnum.DEGRADED)
        assert status.is_healthy() is False

    def test_to_dict(self) -> None:
        """Test converting to dict."""
        checks = [
            HealthCheckItem(name="test", status=HealthStatusEnum.UP, detail="OK"),
        ]
        timestamp = datetime(2025, 12, 11, 10, 0, 0, tzinfo=timezone.utc)
        status = HealthStatus(
            status=HealthStatusEnum.UP,
            checks=checks,
            timestamp=timestamp,
        )
        result = status.to_dict()
        assert result["status"] == "UP"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["name"] == "test"
        assert "2025-12-11" in result["timestamp"]
