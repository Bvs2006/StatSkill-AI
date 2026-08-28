import pytest
import jwt
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.security import decode_supabase_jwt, extract_user_role


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "Supabase PostgreSQL (Connected)"


def test_auth_me_fallback():
    # Without Authorization header, fallback demo user should be returned
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "learner"
    assert "rajesh.sharma" in data["email"]


def test_jwt_role_extraction():
    token_learner = jwt.encode({"sub": "user-123", "role": "learner"}, "secret", algorithm="HS256")
    payload = decode_supabase_jwt(token_learner)
    assert extract_user_role(payload) == "learner"

    token_trainer = jwt.encode({"sub": "user-456", "user_metadata": {"role": "trainer"}}, "secret", algorithm="HS256")
    payload_trainer = decode_supabase_jwt(token_trainer)
    assert extract_user_role(payload_trainer) == "trainer"

    token_admin = jwt.encode({"sub": "user-789", "app_metadata": {"role": "admin"}}, "secret", algorithm="HS256")
    payload_admin = decode_supabase_jwt(token_admin)
    assert extract_user_role(payload_admin) == "admin"


def test_rbac_verification_endpoints():
    token_trainer = jwt.encode({"sub": "user-456", "role": "trainer"}, "secret", algorithm="HS256")
    
    # Trainer accessing trainer endpoint -> 200 OK
    res = client.get("/api/auth/verify-trainer", headers={"Authorization": f"Bearer {token_trainer}"})
    assert res.status_code == 200
    assert res.json()["role"] == "trainer"

    # Trainer accessing admin endpoint -> 403 Forbidden
    res_admin = client.get("/api/auth/verify-admin", headers={"Authorization": f"Bearer {token_trainer}"})
    assert res_admin.status_code == 403
