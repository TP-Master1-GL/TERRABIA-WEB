# auth_app/config_loader.py
import os
from .config import get_config

# Variable globale pour stocker la config récupérée une seule fois
CONFIG = None

def get_app_config():
    global CONFIG
    if CONFIG is None:
        CONFIG = get_config()  # Appelle le Config Server une seule fois
    return CONFIG
