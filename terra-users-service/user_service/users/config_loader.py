from .config import get_config
import logging

logger = logging.getLogger(__name__)

# Cache pour éviter de recharger la config à chaque appel
_config_cache = None

def get_app_config():
    """
    Charge la configuration une seule fois depuis le Config Server
    ou depuis la fonction fallback dans config.py
    """
    global _config_cache
    if _config_cache is None:
        try:
            _config_cache = get_config(service_name="terra-users-service")
            logger.info("Configuration chargée depuis terra-conf-service pour terra-users-service")
        except Exception as e:
            logger.error(f"Impossible de charger la config : {e}")
            _config_cache = get_config(service_name="terra-users-service")  # fallback déjà géré dedans
    return _config_cache