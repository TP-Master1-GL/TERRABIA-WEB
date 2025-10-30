# auth_app/tests/test_auth.py
import uuid
import json
import jwt
import bcrypt
from unittest import mock
from datetime import datetime, timedelta
from django.test import TestCase, Client
from django.urls import reverse
from auth_app.models import User, RefreshToken, BlacklistToken

# === CONSTANTES TEST ===
JWT_SECRET = "test-secret-1234567890"
JWT_EXP = 900         # 15 min
REFRESH_EXP = 7       # 7 jours


# ===================================================================
# 🔧 UTILITAIRE COMMUN POUR LES TESTS
# ===================================================================
class AuthTestMixin:
    def create_user(self, email="user@test.com", role="acheteur", active=True):
        """Crée un utilisateur avec mot de passe haché."""
        password_hash = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
        return User.objects.create(email=email, password=password_hash, role=role, is_active=active)

    def generate_access_token(self, user):
        """Génère un token JWT valide."""
        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return token.decode() if isinstance(token, bytes) else token

    def post_json(self, url_name, data=None, token=None):
        """Simplifie les appels POST JSON."""
        headers = {}
        if token:
            headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        return self.client.post(
            reverse(url_name),
            data=json.dumps(data or {}),
            content_type="application/json",
            **headers
        )

    def get_json(self, url_name, token=None):
        """Simplifie les appels GET JSON."""
        headers = {}
        if token:
            headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        return self.client.get(reverse(url_name), **headers)


# ===================================================================
# 🧪 TESTS LOGIN
# ===================================================================
@mock.patch("auth_app.views.get_config")
class TestLoginEndpoint(AuthTestMixin, TestCase):

    def setUp(self):
        self.client = Client()
        self.user = self.create_user(email="login@test.com")

    def test_login_success(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('login', {"email": "login@test.com", "password": "password123"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("accessToken", data)
        self.assertIn("refreshToken", data)
        self.assertTrue(RefreshToken.objects.filter(token=data["refreshToken"]).exists())

    def test_login_wrong_password(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('login', {"email": "login@test.com", "password": "wrong"})
        self.assertEqual(response.status_code, 401)

    def test_login_user_not_found(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('login', {"email": "ghost@test.com", "password": "password123"})
        self.assertEqual(response.status_code, 401)

    def test_login_inactive_user(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        inactive_user = self.create_user("inactive@test.com", active=False)
        response = self.post_json('login', {"email": "inactive@test.com", "password": "password123"})
        self.assertEqual(response.status_code, 403)

    def test_login_missing_fields(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('login', {})
        self.assertEqual(response.status_code, 400)


# ===================================================================
# 🧪 TESTS REFRESH TOKEN
# ===================================================================
@mock.patch("auth_app.views.get_config")
class TestRefreshEndpoint(AuthTestMixin, TestCase):

    def setUp(self):
        self.client = Client()
        self.user = self.create_user(email="refresh@test.com", role="vendeur")
        self.refresh_token = RefreshToken.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expiration=datetime.utcnow() + timedelta(days=REFRESH_EXP)
        )

    def test_refresh_valid_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('refresh', {"refreshToken": self.refresh_token.token})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        payload = jwt.decode(data["accessToken"], JWT_SECRET, algorithms=["HS256"])
        self.assertEqual(payload["user_id"], str(self.user.id))

    def test_refresh_invalid_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('refresh', {"refreshToken": "fake-token"})
        self.assertEqual(response.status_code, 401)

    def test_refresh_expired_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        expired = RefreshToken.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expiration=datetime.utcnow() - timedelta(seconds=1)
        )
        response = self.post_json('refresh', {"refreshToken": expired.token})
        self.assertEqual(response.status_code, 401)

    def test_refresh_blacklisted_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        with mock.patch("auth_app.views.BlacklistToken.objects.filter") as mock_blacklist:
            mock_blacklist.return_value.exists.return_value = True
            response = self.post_json('refresh', {"refreshToken": self.refresh_token.token})
            self.assertEqual(response.status_code, 401)


# ===================================================================
# 🧪 TESTS VALIDATE TOKEN
# ===================================================================
@mock.patch("auth_app.views.get_config")
class TestValidateEndpoint(AuthTestMixin, TestCase):

    def setUp(self):
        self.client = Client()
        self.user = self.create_user(email="validate@test.com", role="admin")
        self.access_token = self.generate_access_token(self.user)

    def test_validate_valid_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.get_json('validate', token=self.access_token)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["valide"])
        self.assertEqual(data["user_id"], str(self.user.id))
        self.assertEqual(data["role"], "admin")

    def test_validate_expired_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        expired_payload = {
            "user_id": str(self.user.id),
            "role": self.user.role,
            "exp": datetime.utcnow() - timedelta(seconds=1)
        }
        expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm="HS256")
        if isinstance(expired_token, bytes):
            expired_token = expired_token.decode()
        response = self.get_json('validate', token=expired_token)
        self.assertEqual(response.status_code, 401)

    def test_validate_blacklisted_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        BlacklistToken.objects.create(
            token=self.access_token,
            expiration=datetime.utcnow() + timedelta(hours=1)
        )
        response = self.get_json('validate', token=self.access_token)
        self.assertEqual(response.status_code, 401)

    def test_validate_malformed_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.get_json('validate', token="bad.token.here")
        self.assertEqual(response.status_code, 401)

    def test_validate_missing_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.get_json('validate')
        self.assertEqual(response.status_code, 401)


# ===================================================================
# 🧪 TESTS LOGOUT
# ===================================================================
@mock.patch("auth_app.views.get_config")
class TestLogoutEndpoint(AuthTestMixin, TestCase):

    def setUp(self):
        self.client = Client()
        self.user = self.create_user(email="logout@test.com", role="acheteur")
        self.access_token = self.generate_access_token(self.user)
        self.refresh_token = RefreshToken.objects.create(
            user=self.user,
            token=str(uuid.uuid4()),
            expiration=datetime.utcnow() + timedelta(days=REFRESH_EXP)
        )

    def test_logout_success(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('logout', token=self.access_token)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(BlacklistToken.objects.filter(token=self.access_token).exists())
        self.assertFalse(RefreshToken.objects.filter(user=self.user).exists())

    def test_logout_invalid_token(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        response = self.post_json('logout', token="fake.token.jwt")
        self.assertEqual(response.status_code, 401)

    def test_logout_already_blacklisted(self, mock_config):
        mock_config.return_value = {"auth.jwt_secret": JWT_SECRET, "auth.jwt_expiration": JWT_EXP, "auth.refresh_expiration": REFRESH_EXP}
        BlacklistToken.objects.create(
            token=self.access_token,
            expiration=datetime.utcnow() + timedelta(hours=1)
        )
        response = self.post_json('logout', token=self.access_token)
        self.assertEqual(response.status_code, 200)
