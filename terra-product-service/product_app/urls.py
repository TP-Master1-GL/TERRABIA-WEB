from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduitViewSet, CategorieViewSet, MediaViewSet, ProduitSearchView

router = DefaultRouter()
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'medias', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
    path('produits/recherche/', ProduitSearchView.as_view(), name='produit-search'),
]
