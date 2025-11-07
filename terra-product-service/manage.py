#!/usr/bin/env python3
import os
import sys
from product_app.config_loader import get_app_config

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terra_product_service.settings')

    # Récupérer le port depuis la config chargée une seule fois
    config = get_app_config()
    port = config.get("server.port", "8000")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Ajouter le port si nécessaire
    if len(sys.argv) == 1 or (sys.argv[1] == 'runserver' and len(sys.argv) == 2):
        sys.argv.append(port)

    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

