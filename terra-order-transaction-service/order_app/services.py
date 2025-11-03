import requests
import json
import logging
from django.conf import settings
from .models import Order, OrderItem, Transaction
from decimal import Decimal
from django.utils import timezone

logger = logging.getLogger(__name__)

class CatalogService:
    """Service pour communiquer avec le service catalogue"""
    
    @staticmethod
    def get_product_details(product_id):
        try:
            response = requests.get(
                f"{settings.MICROSERVICES['catalog_service']}/api/products/{product_id}/",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            return None
        except requests.RequestException as e:
            logger.error(f"Error fetching product {product_id}: {str(e)}")
            return None
    
    @staticmethod
    def reserve_stock(product_id, quantity):
        try:
            payload = {
                'product_id': product_id,
                'quantity': str(quantity)
            }
            response = requests.post(
                f"{settings.MICROSERVICES['catalog_service']}/api/products/reserve-stock/",
                json=payload,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error reserving stock for {product_id}: {str(e)}")
            return False
    
    @staticmethod
    def release_stock(product_id, quantity):
        try:
            payload = {
                'product_id': product_id,
                'quantity': str(quantity)
            }
            response = requests.post(
                f"{settings.MICROSERVICES['catalog_service']}/api/products/release-stock/",
                json=payload,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error releasing stock for {product_id}: {str(e)}")
            return False

class UserService:
    """Service pour communiquer avec le service utilisateur"""
    
    @staticmethod
    def validate_user(user_id):
        try:
            response = requests.get(
                f"{settings.MICROSERVICES['user_service']}/api/users/{user_id}/",
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error validating user {user_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_user_details(user_id):
        try:
            response = requests.get(
                f"{settings.MICROSERVICES['user_service']}/api/users/{user_id}/",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            return None
        except requests.RequestException as e:
            logger.error(f"Error fetching user {user_id}: {str(e)}")
            return None

class LogisticsService:
    """Service pour communiquer avec le service logistique"""
    
    @staticmethod
    def request_delivery(order_data):
        try:
            payload = {
                'order_id': str(order_data['order_id']),
                'farmer_id': order_data['farmer_id'],
                'buyer_id': order_data['buyer_id'],
                'delivery_address': order_data['delivery_address'],
                'farmer_latitude': str(order_data.get('farmer_latitude', '')),
                'farmer_longitude': str(order_data.get('farmer_longitude', '')),
                'delivery_latitude': str(order_data.get('delivery_latitude', '')),
                'delivery_longitude': str(order_data.get('delivery_longitude', '')),
                'total_amount': str(order_data['total_amount'])
            }
            response = requests.post(
                f"{settings.MICROSERVICES['logistics_service']}/api/deliveries/request/",
                json=payload,
                timeout=10
            )
            if response.status_code == 201:
                return response.json()
            return None
        except requests.RequestException as e:
            logger.error(f"Error requesting delivery: {str(e)}")
            return None
    
    @staticmethod
    def update_delivery_status(delivery_id, status):
        try:
            payload = {'status': status}
            response = requests.patch(
                f"{settings.MICROSERVICES['logistics_service']}/api/deliveries/{delivery_id}/status/",
                json=payload,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error updating delivery status: {str(e)}")
            return False

class NotificationService:
    """Service pour communiquer avec le service de notifications"""
    
    @staticmethod
    def send_notification(notification_data):
        try:
            response = requests.post(
                f"{settings.MICROSERVICES['notification_service']}/api/notifications/send/",
                json=notification_data,
                timeout=10
            )
            return response.status_code == 200
        except requests.RequestException as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False

class OrderService:
    """Service métier pour la gestion des commandes"""
    
    @staticmethod
    def create_order(order_data):
        try:
            # Valider les utilisateurs
            user_service = UserService()
            if not user_service.validate_user(order_data['buyer_id']):
                raise ValueError("Buyer not found")
            if not user_service.validate_user(order_data['farmer_id']):
                raise ValueError("Farmer not found")
            
            # Calculer le sous-total et valider les produits
            subtotal = Decimal('0.00')
            catalog_service = CatalogService()
            
            for item in order_data['items']:
                product_details = catalog_service.get_product_details(item['product_id'])
                if not product_details:
                    raise ValueError(f"Product {item['product_id']} not found")
                
                # Réserver le stock
                if not catalog_service.reserve_stock(item['product_id'], item['quantity']):
                    raise ValueError(f"Insufficient stock for product {item['product_id']}")
                
                item_price = Decimal(str(item['unit_price']))
                item_total = item_price * Decimal(str(item['quantity']))
                subtotal += item_total
            
            # Calculer les frais de livraison (simulé)
            delivery_fee = OrderService.calculate_delivery_fee(order_data)
            total_amount = subtotal + delivery_fee
            
            # Créer la commande
            order = Order.objects.create(
                buyer_id=order_data['buyer_id'],
                farmer_id=order_data['farmer_id'],
                delivery_address=order_data['delivery_address'],
                delivery_latitude=order_data.get('delivery_latitude'),
                delivery_longitude=order_data.get('delivery_longitude'),
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total_amount=total_amount,
                buyer_notes=order_data.get('buyer_notes', '')
            )
            
            # Créer les articles de commande
            for item in order_data['items']:
                OrderItem.objects.create(
                    order=order,
                    product_id=item['product_id'],
                    product_name=item['product_name'],
                    product_category=item.get('product_category', ''),
                    quantity=item['quantity'],
                    unit=item.get('unit', 'kg'),
                    unit_price=item['unit_price'],
                    product_image_url=item.get('product_image_url', ''),
                    notes=item.get('notes', '')
                )
            
            # Publier l'événement de création de commande
            from .tasks import publish_order_created
            publish_order_created.delay(str(order.id))
            
            return order
            
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            # Libérer les stocks réservés en cas d'erreur
            for item in order_data.get('items', []):
                CatalogService.release_stock(item['product_id'], item['quantity'])
            raise
    
    @staticmethod
    def calculate_delivery_fee(order_data):
        # Simulation des frais de livraison
        # Dans la réalité, cela serait calculé par le service logistique
        base_fee = Decimal('500.00')  # 500 XAF de base
        distance_fee = Decimal('100.00')  # Supplément distance
        return base_fee + distance_fee
    
    @staticmethod
    def process_payment(order, payment_data):
        try:
            # Créer la transaction
            transaction = Transaction.objects.create(
                order=order,
                transaction_type='PAYMENT',
                payment_method=payment_data['payment_method'],
                amount=order.total_amount,
                payer_id=payment_data['payer_id'],
                payee_id=payment_data['payee_id'],
                description=payment_data.get('description', 'Payment for order')
            )
            
            # Simuler le paiement (intégration avec Mobile Money)
            payment_success = OrderService.simulate_payment(transaction)
            
            if payment_success:
                transaction.status = 'SUCCESS'
                transaction.save()
                
                # Mettre à jour la commande
                order.status = 'PAID'
                order.paid_at = transaction.processed_at
                order.save()
                
                # Publier l'événement de paiement réussi
                from .tasks import publish_order_paid
                publish_order_paid.delay(str(order.id))
                
                # Demander la livraison
                delivery_data = {
                    'order_id': order.id,
                    'farmer_id': order.farmer_id,
                    'buyer_id': order.buyer_id,
                    'delivery_address': order.delivery_address,
                    'farmer_latitude': order.farmer_latitude,
                    'farmer_longitude': order.farmer_longitude,
                    'delivery_latitude': order.delivery_latitude,
                    'delivery_longitude': order.delivery_longitude,
                    'total_amount': order.total_amount
                }
                
                logistics_service = LogisticsService()
                delivery_response = logistics_service.request_delivery(delivery_data)
                
                if delivery_response:
                    order.delivery_id = delivery_response.get('delivery_id')
                    order.save()
                
                return transaction
            else:
                transaction.status = 'FAILED'
                transaction.save()
                raise ValueError("Payment failed")
                
        except Exception as e:
            logger.error(f"Error processing payment: {str(e)}")
            raise
    
    @staticmethod
    def simulate_payment(transaction):
        # Simulation de paiement Mobile Money
        # Dans la réalité, intégration avec les APIs Orange Money, MTN Momo, etc.
        try:
            # Simuler un délai de traitement
            import time
            time.sleep(2)
            
            # Simuler une réponse positive dans 95% des cas
            import random
            success = random.random() > 0.05
            
            if success:
                transaction.provider_transaction_id = f"PMT{str(transaction.id)[:8].upper()}"
                transaction.provider_response = {
                    'status': 'success',
                    'message': 'Payment processed successfully',
                    'provider': transaction.payment_method
                }
                transaction.processed_at = timezone.now()
            else:
                transaction.provider_response = {
                    'status': 'failed',
                    'message': 'Insufficient funds',
                    'provider': transaction.payment_method
                }
                transaction.failure_reason = 'Insufficient funds'
            
            return success
            
        except Exception as e:
            logger.error(f"Error in payment simulation: {str(e)}")
            return False