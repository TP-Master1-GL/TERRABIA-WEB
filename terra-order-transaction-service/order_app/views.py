from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import JsonResponse
from .models import Order, OrderItem, Transaction, PaymentAttempt
from django.http import JsonResponse
from django.views import View
from django.db import connection
import redis
import requests
from django.http import JsonResponse
from django.views import View
import redis
import psycopg2
from django.conf import settings

from .serializers import (
    OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer,
    TransactionSerializer, CreateTransactionSerializer
)
from .services import OrderService, UserService, CatalogService
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
import logging

logger = logging.getLogger(__name__)

@extend_schema_view(
    list=extend_schema(
        summary="Lister toutes les commandes",
        description="Récupère la liste paginée de toutes les commandes"
    ),
    create=extend_schema(
        summary="Créer une nouvelle commande",
        description="Crée une nouvelle commande avec les articles spécifiés"
    ),
    retrieve=extend_schema(
        summary="Récupérer une commande",
        description="Récupère les détails d'une commande spécifique"
    ),
    update=extend_schema(
        summary="Mettre à jour une commande",
        description="Met à jour le statut d'une commande"
    ),
    partial_update=extend_schema(
        summary="Mettre à jour partiellement une commande",
        description="Met à jour partiellement une commande"
    ),
    destroy=extend_schema(
        summary="Supprimer une commande",
        description="Supprime une commande (désactivé par défaut)"
    ),
)
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateOrderStatusSerializer
        return OrderSerializer
    
    def create(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                order = OrderService.create_order(serializer.validated_data)
                response_serializer = OrderSerializer(order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        order = self.get_object()
        
        if order.status != 'CONFIRMED':
            return Response(
                {'error': 'Order must be confirmed before payment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CreateTransactionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                transaction = OrderService.process_payment(order, serializer.validated_data)
                transaction_serializer = TransactionSerializer(transaction)
                return Response(transaction_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        cancellation_reason = request.data.get('cancellation_reason', '')
        
        if order.status in ['DELIVERED', 'COMPLETED']:
            return Response(
                {'error': 'Cannot cancel delivered or completed order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            order.status = 'CANCELLED'
            order.cancellation_reason = cancellation_reason
            order.cancelled_at = timezone.now()
            order.save()
            
            # Libérer les stocks réservés
            for item in order.items.all():
                CatalogService.release_stock(item.product_id, item.quantity)
            
            # Publier l'événement d'annulation
            from .tasks import publish_order_cancelled
            publish_order_cancelled.delay(str(order.id))
            
            serializer = OrderSerializer(order)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def buyer_orders(self, request):
        buyer_id = request.query_params.get('buyer_id')
        if not buyer_id:
            return Response(
                {'error': 'buyer_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = Order.objects.filter(buyer_id=buyer_id).order_by('-created_at')
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def farmer_orders(self, request):
        farmer_id = request.query_params.get('farmer_id')
        if not farmer_id:
            return Response(
                {'error': 'farmer_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = Order.objects.filter(farmer_id=farmer_id).order_by('-created_at')
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

@extend_schema_view(
    list=extend_schema(
        summary="Lister toutes les transactions",
        description="Récupère la liste paginée de toutes les transactions financières"
    ),
    create=extend_schema(
        summary="Créer une nouvelle transaction",
        description="Crée une nouvelle transaction financière"
    ),
    retrieve=extend_schema(
        summary="Récupérer une transaction",
        description="Récupère les détails d'une transaction spécifique"
    ),
)
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    @action(detail=False, methods=['get'])
    def user_transactions(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = Transaction.objects.filter(
            models.Q(payer_id=user_id) | models.Q(payee_id=user_id)
        ).order_by('-created_at')
        
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

# Views supplémentaires
@api_view(['GET'])
def health_check(request):
    """Endpoint de santé du service"""
    return Response({
        'status': 'healthy',
        'service': 'terra-order-transaction-service',
        'version': '1.0.0'
    })

@api_view(['POST'])
def refresh_configuration(request):
    """Rafraîchir la configuration depuis le service de configuration"""
    try:
        from config.configuration_client import ConfigurationClient
        config_data = ConfigurationClient.refresh_configuration()
        if config_data:
            return Response({
                'status': 'success',
                'message': 'Configuration refreshed successfully',
                'data': config_data
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Failed to refresh configuration'
            }, status=500)
    except Exception as e:
        logger.error(f"Error refreshing configuration: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['POST'])
def register_eureka(request):
    """S'enregistrer auprès d'Eureka"""
    try:
        from config.configuration_client import EurekaClient
        success = EurekaClient.register_with_eureka()
        if success:
            return Response({
                'status': 'success',
                'message': 'Successfully registered with Eureka'
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Failed to register with Eureka'
            }, status=500)
    except Exception as e:
        logger.error(f"Error registering with Eureka: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['POST'])
def unregister_eureka(request):
    """Se désenregistrer d'Eureka"""
    try:
        from config.configuration_client import EurekaClient
        success = EurekaClient.unregister_from_eureka()
        if success:
            return Response({
                'status': 'success',
                'message': 'Successfully unregistered from Eureka'
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Failed to unregister from Eureka'
            }, status=500)
    except Exception as e:
        logger.error(f"Error unregistering from Eureka: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['POST'])
def payment_webhook(request):
    """Webhook pour les notifications de paiement"""
    try:
        webhook_data = request.data
        transaction_id = webhook_data.get('transaction_id')
        
        if not transaction_id:
            return Response({'error': 'transaction_id is required'}, status=400)
        
        # Traiter le webhook de manière asynchrone
        from .tasks import process_payment_webhook
        process_payment_webhook.delay(transaction_id, webhook_data)
        
        return Response({'status': 'webhook received'})
        
    except Exception as e:
        logger.error(f"Error processing payment webhook: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def delivery_webhook(request):
    """Webhook pour les mises à jour de livraison"""
    try:
        webhook_data = request.data
        order_id = webhook_data.get('order_id')
        delivery_status = webhook_data.get('status')
        
        if not order_id or not delivery_status:
            return Response(
                {'error': 'order_id and status are required'}, 
                status=400
            )
        
        # Mettre à jour le statut de la commande
        try:
            order = Order.objects.get(id=order_id)
            
            status_mapping = {
                'PICKED_UP': 'IN_DELIVERY',
                'DELIVERED': 'DELIVERED',
                'FAILED': 'CANCELLED'
            }
            
            if delivery_status in status_mapping:
                order.status = status_mapping[delivery_status]
                if delivery_status == 'DELIVERED':
                    order.delivered_at = timezone.now()
                order.save()
                
                # Publier l'événement de mise à jour
                from .tasks import RabbitMQPublisher
                event_data = {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'status': order.status,
                    'delivery_status': delivery_status
                }
                RabbitMQPublisher.publish_event('order.status.updated', event_data)
            
            return Response({'status': 'delivery status updated'})
            
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
    except Exception as e:
        logger.error(f"Error processing delivery webhook: {str(e)}")
        return Response({'error': str(e)}, status=500)

def error_404(request, exception):
    return JsonResponse({
        'error': 'Endpoint not found',
        'status_code': 404,
        'service': 'terra-order-transaction-service'
    }, status=404)

def error_500(request):
    return JsonResponse({
        'error': 'Internal server error',
        'status_code': 500,
        'service': 'terra-order-transaction-service'
    }, status=500)
    
    
    


# class HealthCheckView(View):
#     def get(self, request):
#         # Vérifier la base de données
#         try:
#             with connection.cursor() as cursor:
#                 cursor.execute("SELECT 1")
#             db_status = "UP"
#         except Exception:
#             db_status = "DOWN"

#         # Vérifier Redis
#         try:
#             r = redis.Redis(
#                 host=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][0],
#                 port=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][1],
#                 socket_connect_timeout=3
#             )
#             r.ping()
#             redis_status = "UP"
#         except Exception:
#             redis_status = "DOWN"

#         health_status = {
#             "status": "UP" if db_status == "UP" else "DOWN",
#             "components": {
#                 "db": {
#                     "status": db_status
#                 },
#                 "redis": {
#                     "status": redis_status
#                 }
#             }
#         }

#         return JsonResponse(health_status)
    
    
class HealthCheckView(View):
    def get(self, request):
        """Endpoint de health check pour Eureka"""
        checks = {
            'status': 'UP',
            'components': {}
        }
        
        # Vérifier la base de données
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            checks['components']['database'] = {'status': 'UP'}
        except Exception as e:
            checks['components']['database'] = {'status': 'DOWN', 'details': str(e)}
            checks['status'] = 'DOWN'
        
        # Vérifier Redis
        try:
            r = redis.Redis(
                host=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][0],
                port=settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0][1],
                socket_connect_timeout=1
            )
            r.ping()
            checks['components']['redis'] = {'status': 'UP'}
        except Exception as e:
            checks['components']['redis'] = {'status': 'DOWN', 'details': str(e)}
        
        return JsonResponse(checks, status=200 if checks['status'] == 'UP' else 503)