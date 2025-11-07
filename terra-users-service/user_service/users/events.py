import json
import pika
import os
import atexit
import time

# --- Configuration RabbitMQ ---
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_EXCHANGE = os.getenv('RABBITMQ_EXCHANGE', 'users_exchange')

class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._connect()
        atexit.register(self.close)

    def _connect(self, retries=5, delay=3):
        """Tentative de connexion avec plusieurs essais"""
        for attempt in range(1, retries + 1):
            try:
                print(f"[RabbitMQ] Connexion à {RABBITMQ_HOST}:{RABBITMQ_PORT} (tentative {attempt}/{retries})...")
                self.connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=RABBITMQ_HOST,
                        port=RABBITMQ_PORT,
                        heartbeat=600,
                        blocked_connection_timeout=300
                    )
                )
                self.channel = self.connection.channel()
                self.channel.exchange_declare(
                    exchange=RABBITMQ_EXCHANGE,
                    exchange_type='fanout',
                    durable=True
                )
                print("[RabbitMQ] ✅ Connexion établie et échange déclaré.")
                return
            except Exception as e:
                print(f"[RabbitMQ] ❌ Erreur de connexion : {e}")
                time.sleep(delay)

        print("[RabbitMQ] ⚠️ Impossible d'établir une connexion après plusieurs tentatives.")
        self.connection = None
        self.channel = None

    def publish(self, event_type: str, payload: dict):
        """Publier un événement JSON vers RabbitMQ"""
        if self.channel is None or self.connection.is_closed:
            self._connect()

        if self.channel:
            message = json.dumps({
                'type': event_type,
                'payload': payload
            })

            try:
                self.channel.basic_publish(
                    exchange=RABBITMQ_EXCHANGE,
                    routing_key='',
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2  # rendre le message persistant
                    )
                )
                print(f"[RabbitMQ] 📤 Événement publié : {event_type}")
            except Exception as e:
                print(f"[RabbitMQ] ❌ Erreur publication {event_type} : {e}")

    def close(self):
        """Fermer proprement la connexion"""
        try:
            if self.connection and self.connection.is_open:
                self.connection.close()
                print("[RabbitMQ] 🔒 Connexion fermée proprement.")
        except Exception as e:
            print(f"[RabbitMQ] ⚠️ Erreur fermeture connexion : {e}")


# --- Instance globale du publisher ---
rabbitmq_publisher = RabbitMQPublisher()


# --- Fonctions d’événements spécifiques ---
def publish_user_created(user):
    rabbitmq_publisher.publish('user_created', {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,         
        'role': getattr(user, 'role', None),
        'created_at': user.date_joined.isoformat()
    })


def publish_user_updated(user):
    rabbitmq_publisher.publish('user_updated', {
        'user_id': user.id,
        'email': user.email,
        'username': user.username, 
        'role': getattr(user, 'role', None),
        'updated_at': getattr(user, 'updated_at', user.date_joined).isoformat()
    })


def publish_user_deleted(user_id):
    rabbitmq_publisher.publish('user_deleted', {'user_id': user_id})


def publish_password_reset_requested(user, token):
    rabbitmq_publisher.publish('password_reset_requested', {
        'user_id': user.id,
        'email': user.email,
        'token': token
    })


def publish_email_verified(user):
    rabbitmq_publisher.publish('email_verified', {
        'user_id': user.id,
        'email': user.email
    })
