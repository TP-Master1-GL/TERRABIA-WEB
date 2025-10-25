import pytest
from unittest.mock import MagicMock
from auth_app.rabbitmq_consumer import callback
from auth_app.models import User
import json
import uuid


@pytest.mark.django_db
def test_rabbitmq_sync_user_create():
    mock_ch = MagicMock()
    mock_method = MagicMock(delivery_tag=999)
    mock_properties = MagicMock()

    user_id = str(uuid.uuid4())
    message = {
        "id": user_id,
        "email": "rabbit@terrabia.com",
        "password": "$2b$12$examplehashedpassword",
        "role": "vendeur"
    }
    body = json.dumps(message).encode('utf-8')

    callback(mock_ch, mock_method, mock_properties, body)

    user = User.objects.get(id=user_id)
    assert user.email == "rabbit@terrabia.com"
    assert user.role == "vendeur"
    assert user.password == message["password"]

    mock_ch.basic_ack.assert_called_once_with(delivery_tag=999)


@pytest.mark.django_db
def test_rabbitmq_sync_user_update():
    # Créer d'abord
    existing = User.objects.create(
        id=uuid.UUID("123e4567-e89b-12d3-a456-426614174000"),
        email="old@terrabia.com",
        password="oldhash",
        role="acheteur"
    )

    mock_ch = MagicMock()
    mock_method = MagicMock(delivery_tag=888)
    mock_properties = MagicMock()  # ⚠️ Ajouté

    message = {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "new@terrabia.com",
        "password": "newhash",
        "role": "admin"
    }
    body = json.dumps(message).encode('utf-8')

    callback(mock_ch, mock_method, mock_properties, body)

    existing.refresh_from_db()
    assert existing.email == "new@terrabia.com"
    assert existing.role == "admin"
    assert existing.password == "newhash"

    mock_ch.basic_ack.assert_called_once_with(delivery_tag=888)
