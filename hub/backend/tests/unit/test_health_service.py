"""Unit tests for health service."""

import pytest

from dip_hub.application import HealthService
from dip_hub.domain.health import HealthCheckerPort, HealthCheckItem
from dip_hub.domain.health.models import HealthStatusEnum


class MockHealthyChecker(HealthCheckerPort):
    """Mock healthy checker for testing."""

    @property
    def name(self) -> str:
        return "mock_healthy"

    def check(self) -> HealthCheckItem:
        return HealthCheckItem(
            name=self.name,
            status=HealthStatusEnum.UP,
            detail="Mock healthy",
        )


class MockUnhealthyChecker(HealthCheckerPort):
    """Mock unhealthy checker for testing."""

    @property
    def name(self) -> str:
        return "mock_unhealthy"

    def check(self) -> HealthCheckItem:
        return HealthCheckItem(
            name=self.name,
            status=HealthStatusEnum.DOWN,
            detail="Mock unhealthy",
        )


class TestHealthService:
    """Tests for HealthService."""

    def test_create_health_service(self) -> None:
        """Test creating a health service."""
        service = HealthService()
        assert service._checkers == []

    def test_create_health_service_with_checkers(self) -> None:
        """Test creating a health service with checkers."""
        checkers = [MockHealthyChecker()]
        service = HealthService(checkers=checkers)
        assert len(service._checkers) == 1

    def test_register_checker(self) -> None:
        """Test registering a checker."""
        service = HealthService()
        checker = MockHealthyChecker()
        service.register_checker(checker)
        assert len(service._checkers) == 1
        assert service._checkers[0] == checker

    def test_check_health_no_checkers(self) -> None:
        """Test check_health with no checkers returns healthy."""
        service = HealthService()
        status = service.check_health()
        assert status.is_healthy() is True
        assert len(status.checks) == 0

    def test_check_health_all_healthy(self) -> None:
        """Test check_health when all checkers are healthy."""
        service = HealthService()
        service.register_checker(MockHealthyChecker())
        service.register_checker(MockHealthyChecker())

        status = service.check_health()
        assert status.is_healthy() is True
        assert len(status.checks) == 2

    def test_check_health_one_unhealthy(self) -> None:
        """Test check_health when one checker is unhealthy."""
        service = HealthService()
        service.register_checker(MockHealthyChecker())
        service.register_checker(MockUnhealthyChecker())

        status = service.check_health()
        assert status.is_healthy() is False
        assert len(status.checks) == 2

    def test_check_health_all_unhealthy(self) -> None:
        """Test check_health when all checkers are unhealthy."""
        service = HealthService()
        service.register_checker(MockUnhealthyChecker())
        service.register_checker(MockUnhealthyChecker())

        status = service.check_health()
        assert status.is_healthy() is False
        assert len(status.checks) == 2

    def test_check_readiness(self) -> None:
        """Test check_readiness."""
        service = HealthService()
        service.register_checker(MockHealthyChecker())

        status = service.check_readiness()
        assert status.is_healthy() is True
        assert len(status.checks) == 1

    def test_check_readiness_unhealthy(self) -> None:
        """Test check_readiness when unhealthy."""
        service = HealthService()
        service.register_checker(MockUnhealthyChecker())

        status = service.check_readiness()
        assert status.is_healthy() is False
