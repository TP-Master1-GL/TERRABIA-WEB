import pika
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class RabbitMQConfig:
    """Configuration et gestion de RabbitMQ"""
    
    @staticmethod
    def get_connection():
        """Établir une connexion RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(
                settings.RABBITMQ['username'],
                settings.RABBITMQ['password']
            )
            parameters = pika.ConnectionParameters(
                host=settings.RABBITMQ['host'],
                port=settings.RABBITMQ['port'],
                virtual_host=settings.RABBITMQ.get('vhost', '/'),
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            connection = pika.BlockingConnection(parameters)
            return connection
        except Exception as e:
            logger.error(f"Erreur de connexion RabbitMQ: {str(e)}")
            return None
    
    @staticmethod
    def setup_exchanges_and_queues():
        """Configurer les exchanges et queues nécessaires"""
        connection = RabbitMQConfig.get_connection()
        if not connection:
            return False
        
        try:
            channel = connection.channel()
            
            # Déclarer l'exchange principal pour les événements
            channel.exchange_declare(
                exchange='terra_events',
                exchange_type='topic',
                durable=True
            )
            
            # Queues pour les services spécifiques
            queues = [
                # Queue pour le service de notification
                ('notification_queue', 'order.*'),
                # Queue pour le service logistique
                ('logistics_queue', 'order.paid'),
                # Queue pour le service catalogue (mise à jour des stocks)
                ('catalog_queue', 'order.created,order.cancelled'),
                # Queue pour les logs
                ('logs_queue', '#'),  # Tous les événements
            ]
            
            for queue_name, routing_key in queues:
                channel.queue_declare(queue=queue_name, durable=True)
                channel.queue_bind(
                    exchange='terra_events',
                    queue=queue_name,
                    routing_key=routing_key
                )
            
            connection.close()
            logger.info("Configuration RabbitMQ terminée avec succès")
            return True
            
        except Exception as e:
            logger.error(f"Erreur configuration RabbitMQ: {str(e)}")
            return False