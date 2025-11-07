import pika
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start_consumer():
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        channel.queue_declare(queue='product_queue', durable=True)
        logger.info("[RabbitMQ] ✅ En écoute sur product_queue ...")
        # Ici, tu peux ajouter la logique de consommation
    except Exception as e:
        logger.error(f"[RabbitMQ] Erreur : {e}")
