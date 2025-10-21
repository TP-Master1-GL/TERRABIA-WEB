from django.db import models
import uuid
from datetime import datetime

class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    user_id = models.UUIDField()
    expiration = models.DateTimeField()
    
    class Meta:
        db_table = 'auth_schema_refresh_tokens'  # Préfixe pour simuler le schéma

class BlacklistToken(models.Model):
    token = models.CharField(max_length=512, primary_key=True)
    expiration = models.DateTimeField()
    
    class Meta:
        db_table = 'auth_schema_blacklist_tokens'  # Préfixe pour simuler le schéma