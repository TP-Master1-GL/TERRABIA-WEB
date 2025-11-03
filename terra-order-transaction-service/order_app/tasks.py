from celery import shared_task
import pika
import json
import logging
from django.conf import settings
from .models import Order
from django.utils import timezone

logger = logging.getLogger(__name__)

class RabbitMQPublisher:
    """Classe pour publier des événements dans RabbitMQ"""
    
    @staticmethod
    def publish_event(event_type, data):
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ['host'],
                    port=settings.RABBITMQ['port'],
                    credentials=pika.PlainCredentials(
                        settings.RABBITMQ['username'],
                        settings.RABBITMQ['password']
                    )
                )
            )
            channel = connection.channel()
            
            # Déclarer l'exchange
            channel.exchange_declare(
                exchange='terra_events',
                exchange_type='topic',
                durable=True
            )
            
            # Publier le message
            message = {
                'event_type': event_type,
                'service': 'terra-order-transaction-service',
                'data': data
            }
            
            channel.basic_publish(
                exchange='terra_events',
                routing_key=event_type,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # rendre le message persistant
                )
            )
            
            connection.close()
            logger.info(f"Event published: {event_type}")
            
        except Exception as e:
            logger.error(f"Error publishing event {event_type}: {str(e)}")

@shared_task
def publish_order_created(order_id):
    """Publier un événement de création de commande"""
    try:
        order = Order.objects.get(id=order_id)
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'buyer_id': order.buyer_id,
            'farmer_id': order.farmer_id,
            'status': order.status,
            'total_amount': str(order.total_amount),
            'created_at': order.created_at.isoformat()
        }
        RabbitMQPublisher.publish_event('order.created', data)
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for event publishing")

@shared_task
def publish_order_paid(order_id):
    """Publier un événement de paiement de commande"""
    try:
        order = Order.objects.get(id=order_id)
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'buyer_id': order.buyer_id,
            'farmer_id': order.farmer_id,
            'total_amount': str(order.total_amount),
            'paid_at': order.paid_at.isoformat() if order.paid_at else None
        }
        RabbitMQPublisher.publish_event('order.paid', data)
        
        # Envoyer une notification
        from .services import NotificationService
        notification_data = {
            'user_id': order.farmer_id,
            'notification_type': 'ORDER_PAID',
            'title': 'Nouvelle commande payée',
            'message': f'La commande {order.order_number} a été payée.',
            'data': {
                'order_id': str(order.id),
                'order_number': order.order_number
            }
        }
        NotificationService.send_notification(notification_data)
        
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for event publishing")

@shared_task
def publish_order_cancelled(order_id):
    """Publier un événement d'annulation de commande"""
    try:
        order = Order.objects.get(id=order_id)
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'buyer_id': order.buyer_id,
            'farmer_id': order.farmer_id,
            'cancellation_reason': order.cancellation_reason,
            'cancelled_at': order.cancelled_at.isoformat() if order.cancelled_at else None
        }
        RabbitMQPublisher.publish_event('order.cancelled', data)
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for event publishing")

@shared_task
def process_payment_webhook(transaction_id, webhook_data):
    """Traiter les webhooks de paiement"""
    try:
        from .models import Transaction
        transaction = Transaction.objects.get(id=transaction_id)
        
        # Mettre à jour la transaction avec les données du webhook
        transaction.provider_response = webhook_data
        transaction.provider_transaction_id = webhook_data.get('transaction_id')
        
        if webhook_data.get('status') == 'success':
            transaction.status = 'SUCCESS'
            transaction.processed_at = timezone.now()
            
            # Mettre à jour la commande
            order = transaction.order
            order.status = 'PAID'
            order.paid_at = transaction.processed_at
            order.save()
            
            # Publier l'événement de paiement réussi
            publish_order_paid.delay(str(order.id))
            
        else:
            transaction.status = 'FAILED'
            transaction.failure_reason = webhook_data.get('error_message', 'Payment failed')
        
        transaction.save()
        
    except Transaction.DoesNotExist:
        logger.error(f"Transaction {transaction_id} not found")

@shared_task
def cleanup_expired_orders():
    """Nettoyer les commandes expirées (non payées après 24h)"""
    from django.utils import timezone
    from datetime import timedelta
    
    expiration_time = timezone.now() - timedelta(hours=24)
    expired_orders = Order.objects.filter(
        status='PENDING',
        created_at__lt=expiration_time
    )
    
    for order in expired_orders:
        order.status = 'CANCELLED'
        order.cancellation_reason = 'Expired - Payment not completed within 24 hours'
        order.save()
        
        # Libérer les stocks
        from .services import CatalogService
        for item in order.items.all():
            CatalogService.release_stock(item.product_id, item.quantity)
        
        logger.info(f"Cancelled expired order: {order.order_number}")