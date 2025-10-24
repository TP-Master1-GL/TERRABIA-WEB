from django.db import models
import uuid
from datetime import datetime


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=255)  # haché avec bcrypt
    role = models.CharField(max_length=50, choices=[
        ('acheteur', 'Acheteur'),
        ('vendeur', 'Vendeur'),
        ('admin', 'Administrateur'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_schema_users'

    def __str__(self):
        return f"{self.email} ({self.role})"


class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    user_id = models.UUIDField()
    expiration = models.DateTimeField()
    
    class Meta:
        db_table = 'auth_schema_refresh_tokens'


class BlacklistToken(models.Model):
    token = models.CharField(max_length=512, primary_key=True)
    expiration = models.DateTimeField()
    
    class Meta:
        db_table = 'auth_schema_blacklist_tokens'