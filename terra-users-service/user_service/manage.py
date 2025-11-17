#!/usr/bin/env python
import os
import sys

# Import du chargeur de config personnalisé
from users.config_loader import get_app_config

def main():
    # Chargement du settings Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_service.settings')

    # Récupération de la config centralisée (ou fallback)
    config = get_app_config()
    port = config.get("server.port", "8082")  # 8082 par défaut pour users-service

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Si on lance runserver sans port → on ajoute automatiquement le bon port
    if len(sys.argv) == 1 or (len(sys.argv) >= 2 and sys.argv[1] == 'runserver' and len(sys.argv) == 2):
        sys.argv.append(port)

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()