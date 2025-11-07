import json
import pika
import os
import django
import logging
import time
from django.db import transaction
from django.apps import apps
from .config import get_config

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
# django.setup()


# === CHARGEMENT CONFIGURATION DYNAMIQUE ===
def get_rabbitmq_settings():
    """Récupère la configuration RabbitMQ depuis le config service ou utilise un fallback."""
    config = get_config()
    return {
        "host": config.get("rabbitmq.host", os.getenv("RABBITMQ_HOST", "localhost")),
        "port": int(config.get("rabbitmq.port", os.getenv("RABBITMQ_PORT", 5672))),
        "user": config.get("rabbitmq.user", os.getenv("RABBITMQ_USER", "guest")),
        "password": config.get("rabbitmq.password", os.getenv("RABBITMQ_PASSWORD", "guest")),
        "exchange": config.get("rabbitmq.exchange", os.getenv("RABBITMQ_EXCHANGE", "users_exchange")),
        "queue": config.get("rabbitmq.queue", os.getenv("RABBITMQ_QUEUE", "auth_user_queue")),
    }


# === HANDLERS DES ÉVÉNEMENTS ===
@transaction.atomic
def handle_user_created(payload):
    User = apps.get_model("auth_app", "User")
    logger.info(f"[RabbitMQ] user_created → {payload}")
    User.objects.update_or_create(
        id=payload["user_id"],
        defaults={
            "email": payload.get("email"),
            "role": payload.get("role", "user"),
        },
    )


@transaction.atomic
def handle_user_updated(payload):
    User = apps.get_model("auth_app", "User")
    logger.info(f"[RabbitMQ] user_updated → {payload}")
    user = User.objects.filter(id=payload["user_id"]).first()
    if not user:
        logger.warning(f"[RabbitMQ] Ignoré : user {payload['user_id']} introuvable")
        return
    user.email = payload.get("email", user.email)
    user.role = payload.get("role", user.role)
    user.save()


@transaction.atomic
def handle_user_deleted(payload):
    User = apps.get_model("auth_app", "User")
    logger.info(f"[RabbitMQ] user_deleted → {payload}")
    User.objects.filter(id=payload["user_id"]).delete()


@transaction.atomic
def handle_email_verified(payload):
    User = apps.get_model("auth_app", "User")
    logger.info(f"[RabbitMQ] email_verified → {payload}")
    user = User.objects.filter(id=payload["user_id"]).first()
    if user:
        user.is_active = True
        user.save()


# === TABLE DE ROUTAGE ===
EVENT_HANDLERS = {
    "user_created": handle_user_created,
    "user_updated": handle_user_updated,
    "user_deleted": handle_user_deleted,
    "email_verified": handle_email_verified,
}


# === CONSOMMATEUR PRINCIPAL ===
def start_consumer():
    """Démarre le consommateur RabbitMQ dans un thread (appelé par apps.py)."""
    settings = get_rabbitmq_settings()

    while True:
        try:
            logger.info(f"[RabbitMQ] Connexion à {settings['host']}:{settings['port']} ...")
            credentials = pika.PlainCredentials(settings["user"], settings["password"])
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings["host"],
                    port=settings["port"],
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                )
            )
            channel = connection.channel()

            # Déclaration de l’exchange et de la queue (fanout pour diffusion globale)
            channel.exchange_declare(exchange=settings["exchange"], exchange_type="fanout", durable=True)
            channel.queue_declare(queue=settings["queue"], durable=True)
            channel.queue_bind(exchange=settings["exchange"], queue=settings["queue"])

            logger.info(f"[RabbitMQ] ✅ En écoute sur {settings['queue']} ...")

            def callback(ch, method, properties, body):
                try:
                    message = json.loads(body.decode("utf-8"))
                    event_type = message.get("type")
                    payload = message.get("payload", {})

                    handler = EVENT_HANDLERS.get(event_type)
                    if handler:
                        handler(payload)
                    else:
                        logger.warning(f"[RabbitMQ] Événement inconnu : {event_type}")

                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as e:
                    logger.error(f"[RabbitMQ] Erreur traitement message : {e}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=settings["queue"], on_message_callback=callback)
            channel.start_consuming()

        except Exception as e:
            logger.error(f"[RabbitMQ] ❌ Connexion échouée : {e}. Nouvelle tentative dans 10s...")
            time.sleep(10)
