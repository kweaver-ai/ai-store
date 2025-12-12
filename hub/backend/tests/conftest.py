"""Pytest configuration and fixtures."""

import pytest
from flask import Flask
from flask.testing import FlaskClient

from dip_hub.app import create_app
from dip_hub.application import HealthService
from dip_hub.config import TestingConfig


@pytest.fixture
def app() -> Flask:
    """Create application for testing.

    Returns:
        Flask: The test Flask application.
    """
    config = TestingConfig()
    app = create_app(config)
    return app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    """Create test client.

    Args:
        app: The Flask application.

    Returns:
        FlaskClient: The test client.
    """
    return app.test_client()


@pytest.fixture
def health_service() -> HealthService:
    """Create health service for testing.

    Returns:
        HealthService: A health service instance.
    """
    return HealthService()
