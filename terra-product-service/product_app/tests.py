import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from product_app.views import ProduitViewSet, ProduitSearchView
from product_app.models import Produit, Categorie

# ------------------- Fixtures -------------------

@pytest.fixture
def api_factory():
    return APIRequestFactory()

@pytest.fixture
def categorie():
    return Categorie.objects.create(nom="Fruits", description="Fruits bio")

@pytest.fixture
def produit(categorie):
    return Produit.objects.create(
        nom="Mangue",
        description="Mangue bio délicieuse",
        prix_unitaire=2000,
        unite_mesure="kg",
        est_bio=True,
        est_publier=True,
        categorie=categorie,
        id_agriculteur=1
    )

# ------------------- Tests CRUD -------------------

@pytest.mark.django_db
def test_create_produit(api_factory, categorie):
    factory = api_factory
    view = ProduitViewSet.as_view({'post': 'create'})
    
    data = {
        "nom": "Banane",
        "description": "Banane bio",
        "prix_unitaire": 1000,
        "unite_mesure": "kg",
        "est_bio": True,
        "est_publier": True,
        "categorie": categorie.categorie_id,
        "id_agriculteur": 2
    }

    request = factory.post('/produits/', data, format='json')
    response = view(request)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nom'] == "Banane"

@pytest.mark.django_db
def test_list_produits(api_factory, produit):
    factory = api_factory
    view = ProduitViewSet.as_view({'get': 'list'})
    request = factory.get('/produits/')
    response = view(request)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['nom'] == produit.nom

# ------------------- Tests Recherche -------------------

@pytest.mark.django_db
@patch('product_app.views.requests.get')
def test_search_by_name(mock_get, api_factory, produit):
    # mock la réponse du service USERS pour utilisateur
    mock_get.return_value = MagicMock(status_code=200, json=lambda: [{"id": 1, "nom": "John"}])

    factory = api_factory
    view = ProduitSearchView.as_view()
    
    request = factory.get('/produits/search/?nom=Mangue')
    response = view(request)
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['nom'] == "Mangue"

@pytest.mark.django_db
@patch('product_app.views.requests.get')
def test_search_by_utilisateur(mock_get, api_factory, produit):
    # mock de l'appel au service USERS
    mock_get.side_effect = [
        MagicMock(status_code=200, json=lambda: [{"id": 1, "nom": "John"}]),  # recherche
        MagicMock(status_code=200, json=lambda: {"id": 1, "nom": "John", "note_moyenne": 4.5})  # info vendeur
    ]

    factory = api_factory
    view = ProduitSearchView.as_view()
    
    request = factory.get('/produits/search/?utilisateur=John')
    response = view(request)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]['vendeur_info']['nom'] == "John"
    assert response.data[0]['note_moyenne_vendeur'] == 4.5
