from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Produit, Categorie, Media
from .serializers import (
    ProduitSerializer,
    CategorieSerializer,
    MediaSerializer,
    ProduitSearchSerializer
)
import requests
import os

USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://localhost:8084")


# ------------------- CRUD Produits -------------------
class ProduitViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les produits.

    list:
    Retourne tous les produits.

    retrieve:
    Retourne un produit par ID.

    create:
    Crée un produit.

    update:
    Met à jour un produit.

    partial_update:
    Met à jour partiellement un produit.

    destroy:
    Supprime un produit.
    """
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ------------------- CRUD Catégories -------------------
class CategorieViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les catégories.

    list:
    Retourne toutes les catégories.

    retrieve:
    Retourne une catégorie par ID.

    create:
    Crée une catégorie.

    update:
    Met à jour une catégorie.

    partial_update:
    Met à jour partiellement une catégorie.

    destroy:
    Supprime une catégorie.
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer


# ------------------- CRUD Médias -------------------
class MediaViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les médias (images ou vidéos).

    create:
    Upload d'image ou vidéo pour un produit.
    """
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ------------------- Recherche Produits -------------------
class ProduitSearchView(generics.ListAPIView):
    """
    Recherche de produits par nom, catégorie ou utilisateur.

    query parameters:
    - nom (string) : Nom partiel du produit
    - categorie_id (int) : ID de la catégorie
    - utilisateur (string) : Nom de l'agriculteur

    La recherche par utilisateur interroge le service USERS.
    Chaque produit retourné inclut les informations du vendeur et sa note moyenne.
    """
    serializer_class = ProduitSearchSerializer

    def get_queryset(self):
        queryset = Produit.objects.all()
        nom = self.request.query_params.get('nom')
        categorie_id = self.request.query_params.get('categorie_id')
        utilisateur_nom = self.request.query_params.get('utilisateur')

        if nom:
            queryset = queryset.filter(nom__icontains=nom)
        if categorie_id:
            queryset = queryset.filter(categorie_id=categorie_id)
        if utilisateur_nom:
            # Appel au service USERS
            try:
                resp = requests.get(f"{USERS_SERVICE_URL}/users/search/?nom={utilisateur_nom}", timeout=3)
                if resp.status_code == 200:
                    users = resp.json()
                    user_ids = [u['id'] for u in users] if users else []
                    queryset = queryset.filter(id_agriculteur__in=user_ids)
                else:
                    queryset = Produit.objects.none()
            except Exception:
                queryset = Produit.objects.none()

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        results = []
        for produit in serializer.data:
            vendeur_id = produit['id_agriculteur']
            note = 0
            vendeur_info = {}

            try:
                resp = requests.get(f"{USERS_SERVICE_URL}/users/{vendeur_id}", timeout=3)
                if resp.status_code == 200:
                    vendeur_info = resp.json()
                    note = vendeur_info.get('note_moyenne', 0)
            except Exception:
                vendeur_info = {}
                note = 0

            produit['vendeur_info'] = vendeur_info
            produit['note_moyenne_vendeur'] = note
            results.append(produit)

        return Response(results)
