import json
import pika
import os
import atexit

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_EXCHANGE = os.getenv('RABBITMQ_EXCHANGE', 'users_exchange')


class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._connect()
        # Fermer proprement la connexion à l'arrêt
        atexit.register(self.close)

    def _connect(self):
        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT)
            )
            self.channel = self.connection.channel()
            self.channel.exchange_declare(
                exchange=RABBITMQ_EXCHANGE,
                exchange_type='fanout',  # diffusion à tous les services abonnés
                durable=True
            )
            print("Connexion RabbitMQ établie.")
        except Exception as e:
            print(f"Erreur de connexion RabbitMQ: {e}")
            self.connection = None
            self.channel = None

    def publish(self, event_type: str, payload: dict):
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
                    body=message
                )
                print(f"Événement publié: {event_type}")
            except Exception as e:
                print(f"Erreur lors de la publication de l'événement {event_type}: {e}")

    def close(self):
        if self.connection and self.connection.is_open:
            self.connection.close()
            print("Connexion RabbitMQ fermée.")


# --- Instance globale pour tout le service ---
rabbitmq_publisher = RabbitMQPublisher()


# Fonctions utilitaires
def publish_user_created(user):
    rabbitmq_publisher.publish('user_created', {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'created_at': user.date_joined.isoformat()
    })


def publish_user_updated(user):
    rabbitmq_publisher.publish('user_updated', {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'updated_at': user.date_joined.isoformat()
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
