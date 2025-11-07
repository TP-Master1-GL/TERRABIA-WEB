from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Documentation Swagger / Redoc
schema_view = get_schema_view(
    openapi.Info(
        title="Terra Product Service API",
        default_version='v1',
        description="API pour la gestion des produits, catégories et médias",
        contact=openapi.Contact(email="support@terra.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('product_app.urls')),  # Toutes les routes CRUD + recherche

    # Swagger JSON / YAML
    path('swagger(<format>\.json|\.yaml)', schema_view.without_ui(cache_timeout=0), name='schema-json'),

    # Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Redoc
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
