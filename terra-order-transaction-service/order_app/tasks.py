from celery import shared_task
import pika
import json
import logging
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

logger = logging.getLogger(__name__)

class RabbitMQPublisher:
    """Classe améliorée pour publier des événements dans RabbitMQ"""
    
    @staticmethod
    def get_connection():
        """Crée une connexion RabbitMQ réutilisable"""
        try:
            credentials = pika.PlainCredentials(
                settings.RABBITMQ_USER,
                settings.RABBITMQ_PASSWORD
            )
            
            parameters = pika.ConnectionParameters(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                virtual_host=settings.RABBITMQ_VHOST,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300,
            )
            
            return pika.BlockingConnection(parameters)
        except Exception as e:
            logger.error(f"Error creating RabbitMQ connection: {str(e)}")
            raise
    
    @staticmethod
    def publish_event(exchange, routing_key, event_type, data):
        """Publie un événement dans RabbitMQ avec meilleure gestion des erreurs"""
        connection = None
        try:
            connection = RabbitMQPublisher.get_connection()
            channel = connection.channel()
            
            # Déclarer l'exchange
            channel.exchange_declare(
                exchange=exchange,
                exchange_type='topic',
                durable=True
            )
            
            # Préparer le message avec métadonnées complètes
            message = {
                'event_type': event_type,
                'service': 'terra-order-transaction-service',
                'timestamp': timezone.now().isoformat(),
                'version': '1.0',
                'data': data
            }
            
            # Publier le message
            channel.basic_publish(
                exchange=exchange,
                routing_key=routing_key,
                body=json.dumps(message, default=str),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Message persistant
                    content_type='application/json',
                    timestamp=int(timezone.now().timestamp())
                )
            )
            
            logger.info(f"✅ Event published successfully: {event_type} to {exchange}/{routing_key}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error publishing event {event_type}: {str(e)}")
            return False
        finally:
            if connection and not connection.is_closed:
                connection.close()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def publish_order_created(self, order_id):
    """
    Publier un événement de création de commande avec toutes les informations nécessaires
    Déclenche les actions sur:
    - terra-notification-service (notifications)
    - terra-product-service (réservation stock)
    - terra-users-service (informations utilisateurs)
    """
    try:
        from .models import Order
        from .service_clients import user_client
        
        order = Order.objects.get(id=order_id)
        
        # Récupérer les informations complètes de l'acheteur et agriculteur
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        # Préparer les données complètes de la commande
        order_items = []
        for item in order.items.all():
            order_items.append({
                'product_id': item.product_id,
                'product_name': item.product_name,
                'product_category': item.product_category,
                'quantity': str(item.quantity),
                'unit': item.unit,
                'unit_price': str(item.unit_price),
                'total_price': str(item.total_price),
                'product_image_url': item.product_image_url
            })
        
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'status': order.status,
            
            # Informations acheteur complètes
            'buyer': {
                'id': order.buyer_id,
                'name': buyer_info.get('name', buyer_info.get('username', 'N/A')) if buyer_info else 'N/A',
                'email': buyer_info.get('email', '') if buyer_info else '',
                'phone': buyer_info.get('phone', buyer_info.get('phone_number', '')) if buyer_info else '',
                'user_type': buyer_info.get('user_type', 'buyer') if buyer_info else 'buyer'
            },
            
            # Informations agriculteur complètes
            'farmer': {
                'id': order.farmer_id,
                'name': farmer_info.get('name', farmer_info.get('username', 'N/A')) if farmer_info else 'N/A',
                'email': farmer_info.get('email', '') if farmer_info else '',
                'phone': farmer_info.get('phone', farmer_info.get('phone_number', '')) if farmer_info else '',
                'farm_name': farmer_info.get('farm_name', farmer_info.get('business_name', '')) if farmer_info else '',
                'user_type': farmer_info.get('user_type', 'farmer') if farmer_info else 'farmer',
                'rating': farmer_info.get('rating', 0) if farmer_info else 0
            },
            
            # Montants
            'subtotal': str(order.subtotal),
            'delivery_fee': str(order.delivery_fee),
            'total_amount': str(order.total_amount),
            'currency': 'XAF',
            
            # Articles
            'items': order_items,
            'items_count': len(order_items),
            
            # Livraison
            'delivery_address': order.delivery_address,
            'delivery_location': {
                'latitude': str(order.delivery_latitude) if order.delivery_latitude else None,
                'longitude': str(order.delivery_longitude) if order.delivery_longitude else None
            },
            'farmer_location': {
                'latitude': str(order.farmer_latitude) if order.farmer_latitude else None,
                'longitude': str(order.farmer_longitude) if order.farmer_longitude else None
            },
            
            # Notes
            'buyer_notes': order.buyer_notes,
            
            # Dates
            'created_at': order.created_at.isoformat(),
        }
        
        # Publier l'événement principal
        success = RabbitMQPublisher.publish_event(
            exchange='terra_events',
            routing_key='order.created',
            event_type='ORDER_CREATED',
            data=data
        )
        
        if success:
            # Envoyer des notifications aux parties concernées
            send_order_confirmation_notifications.delay(order_id)
            logger.info(f"📦 Order created event published for {order.order_number}")
        else:
            raise Exception("Failed to publish order created event")
        
    except Exception as e:
        logger.error(f"❌ Error in publish_order_created: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def publish_order_paid(self, order_id, transaction_id=None):
    """
    Publier un événement de paiement de commande
    Déclenche les actions sur:
    - terra-notification-service (confirmation paiement)
    - terra-proxy-service (logistique via service externe)
    - terra-product-service (confirmation stock)
    """
    try:
        from .models import Order, Transaction
        from .service_clients import user_client
        
        order = Order.objects.get(id=order_id)
        
        # Récupérer les informations des utilisateurs
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        # Récupérer la transaction si fournie
        transaction_info = None
        if transaction_id:
            try:
                transaction = Transaction.objects.get(id=transaction_id)
                transaction_info = {
                    'transaction_id': str(transaction.id),
                    'transaction_reference': transaction.transaction_reference,
                    'payment_method': transaction.payment_method,
                    'payment_method_display': transaction.get_payment_method_display(),
                    'amount': str(transaction.amount),
                    'status': transaction.status,
                    'provider_transaction_id': transaction.provider_transaction_id,
                    'processed_at': transaction.processed_at.isoformat() if transaction.processed_at else None
                }
            except Transaction.DoesNotExist:
                pass
        
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'status': order.status,
            
            # Informations acheteur
            'buyer': {
                'id': order.buyer_id,
                'name': buyer_info.get('name', buyer_info.get('username', 'N/A')) if buyer_info else 'N/A',
                'email': buyer_info.get('email', '') if buyer_info else '',
                'phone': buyer_info.get('phone', buyer_info.get('phone_number', '')) if buyer_info else '',
            },
            
            # Informations agriculteur
            'farmer': {
                'id': order.farmer_id,
                'name': farmer_info.get('name', farmer_info.get('username', 'N/A')) if farmer_info else 'N/A',
                'email': farmer_info.get('email', '') if farmer_info else '',
                'phone': farmer_info.get('phone', farmer_info.get('phone_number', '')) if farmer_info else '',
                'farm_name': farmer_info.get('farm_name', farmer_info.get('business_name', '')) if farmer_info else '',
            },
            
            # Montants
            'total_amount': str(order.total_amount),
            'delivery_fee': str(order.delivery_fee),
            'currency': 'XAF',
            
            # Transaction
            'transaction': transaction_info,
            
            # Livraison - Important pour terra-proxy-service (logistique)
            'delivery_address': order.delivery_address,
            'delivery_location': {
                'latitude': str(order.delivery_latitude) if order.delivery_latitude else None,
                'longitude': str(order.delivery_longitude) if order.delivery_longitude else None
            },
            'farmer_location': {
                'latitude': str(order.farmer_latitude) if order.farmer_latitude else None,
                'longitude': str(order.farmer_longitude) if order.farmer_longitude else None
            },
            
            # Dates
            'paid_at': order.paid_at.isoformat() if order.paid_at else None,
            'created_at': order.created_at.isoformat(),
        }
        
        # Publier l'événement
        success = RabbitMQPublisher.publish_event(
            exchange='terra_events',
            routing_key='order.paid',
            event_type='ORDER_PAID',
            data=data
        )
        
        if success:
            # Déclencher le processus de logistique via proxy
            request_delivery_assignment.delay(order_id)
            
            # Envoyer notifications
            send_payment_confirmation_notifications.delay(order_id, transaction_id)
            
            logger.info(f"💰 Order paid event published for {order.order_number}")
        else:
            raise Exception("Failed to publish order paid event")
        
    except Exception as e:
        logger.error(f"❌ Error in publish_order_paid: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def publish_order_cancelled(self, order_id):
    """
    Publier un événement d'annulation de commande
    Déclenche les actions sur:
    - terra-product-service (libération stock)
    - terra-notification-service (notification annulation)
    - terra-auth-service (si remboursement nécessaire)
    """
    try:
        from .models import Order
        from .service_clients import user_client
        
        order = Order.objects.get(id=order_id)
        
        # Récupérer les informations des utilisateurs
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        # Préparer les items pour libération de stock
        items_to_release = []
        for item in order.items.all():
            items_to_release.append({
                'product_id': item.product_id,
                'product_name': item.product_name,
                'quantity': str(item.quantity),
                'unit': item.unit
            })
        
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'status': order.status,
            
            # Informations acheteur
            'buyer': {
                'id': order.buyer_id,
                'name': buyer_info.get('name', buyer_info.get('username', 'N/A')) if buyer_info else 'N/A',
                'email': buyer_info.get('email', '') if buyer_info else '',
                'phone': buyer_info.get('phone', buyer_info.get('phone_number', '')) if buyer_info else '',
            },
            
            # Informations agriculteur
            'farmer': {
                'id': order.farmer_id,
                'name': farmer_info.get('name', farmer_info.get('username', 'N/A')) if farmer_info else 'N/A',
                'email': farmer_info.get('email', '') if farmer_info else '',
                'phone': farmer_info.get('phone', farmer_info.get('phone_number', '')) if farmer_info else '',
            },
            
            # Raison d'annulation
            'cancellation_reason': order.cancellation_reason or 'Non spécifiée',
            'cancelled_at': order.cancelled_at.isoformat() if order.cancelled_at else None,
            'cancelled_by': 'system',  # ou récupérer qui a annulé
            
            # Articles à libérer (important pour terra-product-service)
            'items': items_to_release,
            
            # Montants (pour remboursement si nécessaire)
            'total_amount': str(order.total_amount),
            'was_paid': order.status in ['PAID', 'IN_DELIVERY', 'DELIVERED'],
            'requires_refund': order.paid_at is not None,
        }
        
        # Publier l'événement
        success = RabbitMQPublisher.publish_event(
            exchange='terra_events',
            routing_key='order.cancelled',
            event_type='ORDER_CANCELLED',
            data=data
        )
        
        if success:
            # Libérer les stocks
            release_order_stock.delay(order_id)
            
            # Envoyer notifications
            send_cancellation_notifications.delay(order_id)
            
            logger.info(f"❌ Order cancelled event published for {order.order_number}")
        else:
            raise Exception("Failed to publish order cancelled event")
        
    except Exception as e:
        logger.error(f"❌ Error in publish_order_cancelled: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def publish_order_completed(self, order_id):
    """
    Publier un événement de complétion de commande
    Déclenche les actions sur:
    - terra-notification-service (notifications finales)
    - terra-product-service (confirmation finale stock)
    - Système de paiement agriculteur
    """
    try:
        from .models import Order
        from .service_clients import user_client
        
        order = Order.objects.get(id=order_id)
        
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        data = {
            'order_id': str(order.id),
            'order_number': order.order_number,
            'status': order.status,
            
            # Informations acheteur
            'buyer': {
                'id': order.buyer_id,
                'name': buyer_info.get('name', buyer_info.get('username', 'N/A')) if buyer_info else 'N/A',
                'email': buyer_info.get('email', '') if buyer_info else '',
                'phone': buyer_info.get('phone', buyer_info.get('phone_number', '')) if buyer_info else '',
            },
            
            # Informations agriculteur
            'farmer': {
                'id': order.farmer_id,
                'name': farmer_info.get('name', farmer_info.get('username', 'N/A')) if farmer_info else 'N/A',
                'email': farmer_info.get('email', '') if farmer_info else '',
                'phone': farmer_info.get('phone', farmer_info.get('phone_number', '')) if farmer_info else '',
                'bank_account': farmer_info.get('bank_account', '') if farmer_info else '',
                'mobile_money': farmer_info.get('mobile_money_number', '') if farmer_info else '',
            },
            
            # Informations de livraison
            'delivery_id': order.delivery_id,
            'delivered_at': order.delivered_at.isoformat() if order.delivered_at else None,
            'completed_at': order.completed_at.isoformat() if order.completed_at else None,
            
            # Montants
            'total_amount': str(order.total_amount),
            'delivery_fee': str(order.delivery_fee),
            'subtotal': str(order.subtotal),
            
            # Métriques de performance
            'order_duration_hours': (
                (order.completed_at - order.created_at).total_seconds() / 3600
                if order.completed_at and order.created_at else None
            ),
        }
        
        # Publier l'événement
        success = RabbitMQPublisher.publish_event(
            exchange='terra_events',
            routing_key='order.completed',
            event_type='ORDER_COMPLETED',
            data=data
        )
        
        if success:
            # Envoyer notifications de complétion
            send_completion_notifications.delay(order_id)
            
            # Déclencher le paiement à l'agriculteur
            initiate_farmer_payout.delay(order_id)
            
            logger.info(f"✅ Order completed event published for {order.order_number}")
        else:
            raise Exception("Failed to publish order completed event")
        
    except Exception as e:
        logger.error(f"❌ Error in publish_order_completed: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=5, default_retry_delay=30)
def send_order_confirmation_notifications(self, order_id):
    """
    Envoyer des notifications de confirmation de commande via terra-notification-service
    """
    try:
        from .models import Order
        from .service_clients import user_client, notification_client
        
        order = Order.objects.get(id=order_id)
        
        # Récupérer les infos utilisateurs depuis terra-users-service
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        # ===== NOTIFICATION À L'ACHETEUR =====
        if buyer_info and buyer_info.get('email'):
            buyer_notification = {
                'user_id': order.buyer_id,
                'notification_type': 'ORDER_CREATED',
                'title': '✅ Commande créée avec succès',
                'message': f'Votre commande #{order.order_number} a été créée avec succès.\n\n'
                          f'Montant total: {order.total_amount} XAF\n'
                          f'Nombre d\'articles: {order.items.count()}\n\n'
                          f'Veuillez procéder au paiement pour confirmer votre commande.',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_amount': str(order.total_amount),
                    'status': order.status,
                    'payment_required': True,
                    'items_count': order.items.count()
                },
                'recipient': {
                    'email': buyer_info.get('email'),
                    'phone': buyer_info.get('phone', buyer_info.get('phone_number')),
                    'name': buyer_info.get('name', buyer_info.get('username', 'Cher client'))
                },
                'channels': ['email', 'sms', 'push'],
                'priority': 'high',
                'template': 'order_confirmation',
                'language': buyer_info.get('preferred_language', 'fr')
            }
            
            # Envoyer via terra-notification-service
            notification_client.send_notification(buyer_notification)
            logger.info(f"📧 Notification envoyée à l'acheteur pour {order.order_number}")
        
        # ===== NOTIFICATION À L'AGRICULTEUR =====
        if farmer_info and farmer_info.get('email'):
            farmer_notification = {
                'user_id': order.farmer_id,
                'notification_type': 'NEW_ORDER_RECEIVED',
                'title': '🎉 Nouvelle commande reçue!',
                'message': f'Félicitations! Vous avez reçu une nouvelle commande.\n\n'
                          f'Numéro de commande: #{order.order_number}\n'
                          f'Montant: {order.total_amount} XAF\n'
                          f'Client: {buyer_info.get("name", "N/A") if buyer_info else "N/A"}\n'
                          f'Articles: {order.items.count()}\n\n'
                          f'La commande sera traitée dès réception du paiement.',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_amount': str(order.total_amount),
                    'buyer_name': buyer_info.get('name', 'N/A') if buyer_info else 'N/A',
                    'buyer_phone': buyer_info.get('phone', '') if buyer_info else '',
                    'items_count': order.items.count(),
                    'delivery_address': order.delivery_address
                },
                'recipient': {
                    'email': farmer_info.get('email'),
                    'phone': farmer_info.get('phone', farmer_info.get('phone_number')),
                    'name': farmer_info.get('name', farmer_info.get('username', 'Cher agriculteur'))
                },
                'channels': ['email', 'sms', 'push'],
                'priority': 'high',
                'template': 'new_order_farmer',
                'language': farmer_info.get('preferred_language', 'fr')
            }
            
            notification_client.send_notification(farmer_notification)
            logger.info(f"📧 Notification envoyée à l'agriculteur pour {order.order_number}")
        
    except Exception as e:
        logger.error(f"❌ Error sending order confirmation notifications: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=5, default_retry_delay=30)
def send_payment_confirmation_notifications(self, order_id, transaction_id=None):
    """
    Envoyer des notifications de confirmation de paiement via terra-notification-service
    """
    try:
        from .models import Order, Transaction
        from .service_clients import user_client, notification_client
        
        order = Order.objects.get(id=order_id)
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        payment_method = 'Mobile Money'
        transaction_ref = 'N/A'
        if transaction_id:
            try:
                transaction = Transaction.objects.get(id=transaction_id)
                payment_method = transaction.get_payment_method_display()
                transaction_ref = transaction.transaction_reference
            except Transaction.DoesNotExist:
                pass
        
        # ===== NOTIFICATION À L'ACHETEUR =====
        if buyer_info and buyer_info.get('email'):
            buyer_notification = {
                'user_id': order.buyer_id,
                'notification_type': 'PAYMENT_CONFIRMED',
                'title': '✅ Paiement confirmé!',
                'message': f'Votre paiement de {order.total_amount} XAF a été confirmé avec succès.\n\n'
                          f'Commande: #{order.order_number}\n'
                          f'Méthode: {payment_method}\n'
                          f'Référence: {transaction_ref}\n\n'
                          f'Un livreur sera assigné prochainement. Vous recevrez une notification avec ses coordonnées.',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_amount': str(order.total_amount),
                    'payment_method': payment_method,
                    'transaction_reference': transaction_ref,
                    'status': order.status
                },
                'recipient': {
                    'email': buyer_info.get('email'),
                    'phone': buyer_info.get('phone', buyer_info.get('phone_number')),
                    'name': buyer_info.get('name', buyer_info.get('username'))
                },
                'channels': ['email', 'sms', 'push'],
                'priority': 'high',
                'template': 'payment_confirmation',
                'language': buyer_info.get('preferred_language', 'fr')
            }
            notification_client.send_notification(buyer_notification)
        
        # ===== NOTIFICATION À L'AGRICULTEUR =====
        if farmer_info and farmer_info.get('email'):
            farmer_notification = {
                'user_id': order.farmer_id,
                'notification_type': 'ORDER_PAID',
                'title': '💰 Commande payée!',
                'message': f'Super nouvelle! La commande #{order.order_number} a été payée.\n\n'
                          f'Montant: {order.total_amount} XAF\n'
                          f'Client: {buyer_info.get("name", "N/A") if buyer_info else "N/A"}\n\n'
                          f'Préparez vos produits, un livreur sera assigné sous peu.',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'total_amount': str(order.total_amount),
                    'buyer_name': buyer_info.get('name', 'N/A') if buyer_info else 'N/A',
                    'buyer_phone': buyer_info.get('phone', '') if buyer_info else ''
                },
                'recipient': {
                    'email': farmer_info.get('email'),
                    'phone': farmer_info.get('phone', farmer_info.get('phone_number')),
                    'name': farmer_info.get('name', farmer_info.get('username'))
                },
                'channels': ['email', 'sms', 'push'],
                'priority': 'high',
                'template': 'order_paid_farmer',
                'language': farmer_info.get('preferred_language', 'fr')
            }
            notification_client.send_notification(farmer_notification)
        
    except Exception as e:
        logger.error(f"❌ Error sending payment confirmation notifications: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=5, default_retry_delay=30)
def send_cancellation_notifications(self, order_id):
    """
    Envoyer des notifications d'annulation de commande via terra-notification-service
    """
    try:
        from .models import Order
        from .service_clients import user_client, notification_client
        
        order = Order.objects.get(id=order_id)
        buyer_info = user_client.get_user(order.buyer_id)
        farmer_info = user_client.get_user(order.farmer_id)
        
        # ===== NOTIFICATION À L'ACHETEUR =====
        if buyer_info and buyer_info.get('email'):
            refund_message = ''
            if order.paid_at:
                refund_message = '\n\nVotre remboursement sera traité sous 3-5 jours ouvrables.'
            
            buyer_notification = {
                'user_id': order.buyer_id,
                'notification_type': 'ORDER_CANCELLED',
                'title': '❌ Commande annulée',
                'message': f'Votre commande #{order.order_number} a été annulée.\n\n'
                          f'Raison: {order.cancellation_reason or "Non spécifiée"}\n'
                          f'Montant: {order.total_amount} XAF{refund_message}',
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'cancellation_reason': order.cancellation_reason,
                    'requires_refund': order.paid_at is not None,
                    'total_amount': str(order.total_amount)
                },
                'recipient': {
                    'email': buyer_info.get('email'),
                    'phone': buyer_info.get('phone', buyer_info.get('phone_number')),
                    'name': buyer_info.get('name', buyer_info.get('username'))
                },
                'channels': ['email', 'sms', 'push'],
                'priority':
