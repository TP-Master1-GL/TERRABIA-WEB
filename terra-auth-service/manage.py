#!/usr/bin/env python
import os
import sys
from auth_app.config_loader import get_app_config

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings')

    # Récupération de la config (une seule fois)
    config = get_app_config()
    port = config.get("server.port", "8000")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django...") from exc

    # Si runserver n'a pas de port, ajouter celui récupéré
    if len(sys.argv) == 1 or (sys.argv[1] == 'runserver' and len(sys.argv) == 2):
        sys.argv.append(port)

    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
