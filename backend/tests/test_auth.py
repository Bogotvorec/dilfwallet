"""Unit tests for auth module — password hashing and JWT tokens"""
import pytest
from uuid import uuid4
from jose import JWTError


class TestPasswordHashing:
    """Tests for bcrypt password hashing"""

    def test_hash_and_verify_correct(self):
        from app.utils import hash_password, verify_password
        password = "SecurePass123!"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_hash_and_verify_wrong(self):
        from app.utils import hash_password, verify_password
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_hash_is_not_plaintext(self):
        from app.utils import hash_password
        password = "SecurePass123!"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 20  # bcrypt hashes are ~60 chars

    def test_same_password_different_hashes(self):
        from app.utils import hash_password
        h1 = hash_password("SamePassword")
        h2 = hash_password("SamePassword")
        assert h1 != h2  # bcrypt salts should differ


class TestJWT:
    """Tests for JWT token creation and verification"""

    def test_create_access_token(self):
        from app.auth import create_access_token
        user_id = uuid4()
        token = create_access_token(user_id)
        assert isinstance(token, str)
        assert len(token) > 50

    def test_verify_access_token(self):
        from app.auth import create_access_token, verify_token
        user_id = uuid4()
        token = create_access_token(user_id)
        payload = verify_token(token, "access")
        assert payload["sub"] == str(user_id)
        assert payload["type"] == "access"

    def test_create_refresh_token(self):
        from app.auth import create_refresh_token, verify_token
        user_id = uuid4()
        token = create_refresh_token(user_id)
        payload = verify_token(token, "refresh")
        assert payload["sub"] == str(user_id)
        assert payload["type"] == "refresh"
        assert "jti" in payload  # Unique token ID

    def test_access_token_rejected_as_refresh(self):
        from app.auth import create_access_token, verify_token
        user_id = uuid4()
        token = create_access_token(user_id)
        with pytest.raises(JWTError):
            verify_token(token, "refresh")

    def test_refresh_token_rejected_as_access(self):
        from app.auth import create_refresh_token, verify_token
        user_id = uuid4()
        token = create_refresh_token(user_id)
        with pytest.raises(JWTError):
            verify_token(token, "access")

    def test_invalid_token_raises(self):
        from app.auth import verify_token
        with pytest.raises(JWTError):
            verify_token("invalid.garbage.token", "access")

    def test_refresh_tokens_have_unique_jti(self):
        from app.auth import create_refresh_token, verify_token
        user_id = uuid4()
        t1 = create_refresh_token(user_id)
        t2 = create_refresh_token(user_id)
        p1 = verify_token(t1, "refresh")
        p2 = verify_token(t2, "refresh")
        assert p1["jti"] != p2["jti"]
