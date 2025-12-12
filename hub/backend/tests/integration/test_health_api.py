"""Integration tests for health API endpoints."""

import json

import pytest
from flask import Flask
from flask.testing import FlaskClient


class TestHealthzEndpoint:
    """Tests for /healthz endpoint."""

    def test_healthz_returns_200(self, client: FlaskClient) -> None:
        """Test healthz returns 200 when healthy."""
        response = client.get("/api/internal/dip-hub/v1/healthz")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "UP"
        assert "timestamp" in data
        assert "checks" in data

    def test_healthz_response_format(self, client: FlaskClient) -> None:
        """Test healthz response format."""
        response = client.get("/api/internal/dip-hub/v1/healthz")

        assert response.content_type == "application/json"
        data = json.loads(response.data)

        # Verify response structure matches OpenAPI spec
        assert "status" in data
        assert isinstance(data["status"], str)
        assert "checks" in data
        assert isinstance(data["checks"], list)
        assert "timestamp" in data
        assert isinstance(data["timestamp"], str)

    def test_healthz_includes_application_check(self, client: FlaskClient) -> None:
        """Test healthz includes application health check."""
        response = client.get("/api/internal/dip-hub/v1/healthz")

        data = json.loads(response.data)
        check_names = [check["name"] for check in data["checks"]]
        assert "application" in check_names


class TestReadyzEndpoint:
    """Tests for /readyz endpoint."""

    def test_readyz_returns_200(self, client: FlaskClient) -> None:
        """Test readyz returns 200 when ready."""
        response = client.get("/api/internal/dip-hub/v1/readyz")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "UP"

    def test_readyz_response_format(self, client: FlaskClient) -> None:
        """Test readyz response format."""
        response = client.get("/api/internal/dip-hub/v1/readyz")

        assert response.content_type == "application/json"
        data = json.loads(response.data)

        # Verify response structure
        assert "status" in data
        assert "checks" in data
        assert "timestamp" in data

    def test_readyz_includes_checks(self, client: FlaskClient) -> None:
        """Test readyz includes health checks."""
        response = client.get("/api/internal/dip-hub/v1/readyz")

        data = json.loads(response.data)
        assert len(data["checks"]) > 0


class TestHealthEndpointErrors:
    """Tests for health endpoint error handling."""

    def test_healthz_method_not_allowed(self, client: FlaskClient) -> None:
        """Test healthz returns 405 for non-GET methods."""
        response = client.post("/api/internal/dip-hub/v1/healthz")
        assert response.status_code == 405

    def test_readyz_method_not_allowed(self, client: FlaskClient) -> None:
        """Test readyz returns 405 for non-GET methods."""
        response = client.post("/api/internal/dip-hub/v1/readyz")
        assert response.status_code == 405

    def test_invalid_endpoint_returns_404(self, client: FlaskClient) -> None:
        """Test invalid endpoint returns 404."""
        response = client.get("/api/internal/dip-hub/v1/invalid")
        assert response.status_code == 404
