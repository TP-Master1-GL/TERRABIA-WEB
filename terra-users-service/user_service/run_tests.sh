#!/bin/bash
echo "🔹 Nettoyage de la base de test..."
python3 manage.py flush --no-input
python3 manage.py migrate

echo "🔹 Lancement des tests avec coverage..."
pytest --cov=. --cov-report=term-missing --maxfail=1 --disable-warnings

echo "🔹 Tests terminés."
