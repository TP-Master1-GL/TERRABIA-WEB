from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from order_app.views import health_check, refresh_configuration, register_eureka, unregister_eureka, payment_webhook, delivery_webhook

def api_root(request):
    return JsonResponse({
        'message': 'Terrabia Order & Transaction Service API',
        'version': '1.0.0',
        'service': 'terra-order-transaction-service',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/schema/',
            'swagger': '/api/docs/',
            'redoc': '/api/redoc/',
            'health': '/health/',
            'orders': '/api/orders/',
            'transactions': '/api/transactions/',
            'config': '/config/refresh/',
            'webhooks': {
                'payment': '/webhooks/payment/',
                'delivery': '/webhooks/delivery/'
            }
        }
    })

urlpatterns = [
    # Root
    path('', api_root, name='api_root'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API Routes principales
    path('api/', include('order_app.urls')),
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Configuration endpoints
    path('config/refresh/', refresh_configuration, name='refresh_configuration'),
    path('config/eureka/register/', register_eureka, name='register_eureka'),
    path('config/eureka/unregister/', unregister_eureka, name='unregister_eureka'),
    
    # Webhook endpoints
    path('webhooks/payment/', payment_webhook, name='payment_webhook'),
    path('webhooks/delivery/', delivery_webhook, name='delivery_webhook'),
    
    # Documentation API avec drf-spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Handler pour les erreurs
handler404 = 'order_app.views.error_404'
handler500 = 'order_app.views.error_500'