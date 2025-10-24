# auth_app/rabbitmq_consumer.py
import pika
import json
import threading
from django.apps import apps


def callback(ch, method, properties, body):
    """
    Traite le message RabbitMQ de façon sécurisée.
    Charge le modèle User dynamiquement.
    """
    try:
        data = json.loads(body.decode('utf-8'))
        user_id = data["id"]
        email = data["email"]
        password_hash = data["password"]
        role = data["role"]

        # Charger le modèle dynamiquement
        User = apps.get_model('auth_app', 'User')

        User.objects.update_or_create(
            id=user_id,
            defaults={
                "email": email,
                "password": password_hash,
                "role": role
            }
        )
        print(f"[RabbitMQ] Utilisateur synchronisé : {email}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"[RabbitMQ] Erreur : {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_consumer():
    """
    Démarre le consommateur dans un thread séparé.
    """
    def _run():
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host='localhost')
            )
            channel = connection.channel()

            channel.exchange_declare(exchange='user-events', exchange_type='topic', durable=True)
            channel.queue_declare(queue='auth-user-queue', durable=True)
            channel.queue_bind(
                exchange='user-events',
                queue='auth-user-queue',
                routing_key='user.created'
            )

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue='auth-user-queue', on_message_callback=callback)

            print("[RabbitMQ] Consommateur démarré – écoute user.created")
            channel.start_consuming()
        except Exception as e:
            print(f"[RabbitMQ] Erreur fatale : {e}")

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()