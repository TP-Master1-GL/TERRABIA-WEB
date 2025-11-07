# auth_app/config.py
import requests
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_config(service_name="terra-auth-service"):
    """
    Récupère la configuration depuis le serveur de configuration central.
    Si le serveur est indisponible après plusieurs tentatives,
    retourne une configuration par défaut pour assurer la résilience du service.
    """
    url = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
    max_retries = 5
    for i in range(max_retries):
        try:
            resp = requests.get(f"{url}/{service_name}/default", timeout=15)
            if resp.status_code == 200:
                source = resp.json()["propertySources"][0]["source"]
                logger.info("✅ Config récupérée depuis terra-conf-service")
                return source
        except Exception as e:
            logger.warning(f"Tentative {i+1}/{max_retries} : Config Server indisponible → {e}")
        time.sleep(2)
    # Config par défaut
    logging.warning("Config Server indisponible → utilisation des valeurs par défaut")

    DEFAULT_CONFIG = {
        "server.port": "8000",
        "auth.jwt_secret": "fallback-secret-key-2025",
        "auth.jwt_expiration": "900",
        "auth.refresh_expiration": "7",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/"
    }
    return DEFAULT_CONFIG


def get_fake_config():
    """Configuration factice pour les tests."""
    return {
        "server.port": "8000",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
        "auth.jwt_secret": "test-secret-key-2025",
        "auth.jwt_expiration": "900",
        "auth.refresh_expiration": "7"
    }


# # auth_app/config.py
# import os
# import time
# import requests
# import logging

# # Configuration du logger
# logger = logging.getLogger(__name__)

# def get_config():
#     """Récupère la configuration depuis le Config Server (Spring Cloud Config)
#     ou retourne une configuration par défaut si le serveur est indisponible.
#     """
#     url = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
#     max_retries = 5

#     for i in range(max_retries):
#         try:
#             resp = requests.get(f"{url}/terra-auth-service/default", timeout=5)
#             if resp.status_code == 200:
#                 source = resp.json()["propertySources"][0]["source"]
#                 logger.info("✅ Config récupérée depuis terra-conf-service")
#                 # Conversion éventuelle en entier pour les durées
#                 source["auth.jwt_expiration"] = int(source.get("auth.jwt_expiration", 900))
#                 source["auth.refresh_expiration"] = int(source.get("auth.refresh_expiration", 7))
#                 return source
#         except Exception as e:
#             logger.warning(f"Tentative {i+1}/{max_retries} : Config Server indisponible → {e}")
#         time.sleep(2)

#     # Config par défaut (fallback)
#     logger.error("⚠️ Config Server indisponible → utilisation des valeurs par défaut")
#     return {
#         "server.port": "8000",
#         "auth.jwt_secret": os.getenv("JWT_SECRET", "fallback-secret-key-2025"),
#         "auth.jwt_expiration": 900,   # 15 minutes
#         "auth.refresh_expiration": 7, # 7 jours
#         "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/"
#     }


# def get_fake_config():
#     """Configuration factice pour les tests (ne contacte pas le config server)."""
#     return {
#         "server.port": "8000",
#         "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
#         "auth.jwt_secret": "test-secret-key-2025",
#         "auth.jwt_expiration": 900,
#         "auth.refresh_expiration": 7
#     }
