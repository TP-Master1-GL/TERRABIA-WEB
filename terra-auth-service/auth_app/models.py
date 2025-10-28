# auth_app/models.py
from django.db import models
from django.utils import timezone
import uuid


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=255)  # mot de passe haché (bcrypt)
    role = models.CharField(
        max_length=50,
        choices=[
            ('acheteur', 'Acheteur'),
            ('vendeur', 'Vendeur'),
            ('admin', 'Administrateur'),
        ]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_schema_users'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.email} ({self.role})"


class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    expiration = models.DateTimeField()

    class Meta:
        db_table = 'auth_schema_refresh_tokens'
        verbose_name = "Token de rafraîchissement"
        verbose_name_plural = "Tokens de rafraîchissement"

    def is_expired(self):
        """Vérifie si le token est expiré."""
        return self.expiration < timezone.now()

    def __str__(self):
        return f"Token pour {self.user.email} (expire le {self.expiration})"


class BlacklistToken(models.Model):
    token = models.CharField(max_length=512, primary_key=True)
    expiration = models.DateTimeField()

    class Meta:
        db_table = 'auth_schema_blacklist_tokens'
        verbose_name = "Token blacklisté"
        verbose_name_plural = "Tokens blacklistés"

    def is_expired(self):
        """Vérifie si le token blacklisté est expiré."""
        return self.expiration < timezone.now()

    def __str__(self):
        return f"BlacklistToken (expire le {self.expiration})"
