#!/bin/bash

echo "🧪 Lancement des tests Terrabia Order Service..."

# Activer l'environnement virtuel
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Environnement virtuel activé"
fi

# Installation des dépendances de test
if [ -f "requirements-test.txt" ]; then
    echo "📦 Installation des dépendances de test..."
    pip install -r requirements-test.txt
else
    echo "📦 Installation des dépendances de test manquantes..."
    pip install pytest pytest-django pytest-cov pytest-mock freezegun factory-boy coverage
fi

echo "🔧 Configuration de l'environnement de test..."

# Méthode 1: Tests avec discovery pattern
echo "🔬 Tests unitaires (modèles)..."
python manage.py test order_app.tests.unit.test_models --verbosity=2

echo "🔬 Tests unitaires (serializers)..."
python manage.py test order_app.tests.unit.test_serializers --verbosity=2

echo "🔬 Tests unitaires (services)..."
python manage.py test order_app.tests.unit.test_services --verbosity=2

echo "🔬 Tests unitaires (tasks)..."
python manage.py test order_app.tests.unit.test_tasks --verbosity=2

echo "🔗 Tests d'intégration..."
python manage.py test order_app.tests.integration.test_order_flow --verbosity=2

# Méthode 2: Tous les tests
echo "📊 Tous les tests..."
python manage.py test order_app.tests --verbosity=2

echo "✅ Tous les tests terminés!"