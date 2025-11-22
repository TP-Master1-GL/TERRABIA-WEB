# product_app/config_loader.py
from .config import get_config

# Constante globale pour stocker la config récupérée une seule fois
CONFIG = None

def get_app_config():
    """
    Retourne la configuration du service.
    Appelle le Config Server **une seule fois** et stocke le résultat globalement.
    """
    global CONFIG
    if CONFIG is None:
        CONFIG = get_config()  # Appel initial au Config Server
    return CONFIG
