import requests
import time
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_config(service_name="terra-product-service"):
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

    logger.warning("Config Server indisponible → fallback")
    return {
        "server.port": "8000",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/"
    }

# # product_app/config.py
# import requests
# import os
# import time
# import logging

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def get_config(service_name="terra-product-service"):
#     """
#     Récupère la configuration depuis le serveur de configuration central.
#     Si le serveur est indisponible après plusieurs tentatives,
#     retourne une configuration par défaut.
#     """
#     url = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
#     max_retries = 5
#     for i in range(max_retries):
#         try:
#             resp = requests.get(f"{url}/{service_name}/default", timeout=5)
#             if resp.status_code == 200:
#                 source = resp.json()["propertySources"][0]["source"]
#                 logger.info("✅ Config récupérée depuis terra-conf-service")
#                 return source
#         except Exception as e:
#             logger.warning(f"Tentative {i+1}/{max_retries} : Config Server indisponible → {e}")
#         time.sleep(2)

#     # Config par défaut si le serveur est indisponible
#     logging.warning("Config Server indisponible → utilisation des valeurs par défaut")
#     DEFAULT_CONFIG = {
#         "server.port": "8000",
#         "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/"
#     }
#     return DEFAULT_CONFIG


def get_fake_config():
    """Configuration factice pour les tests."""
    return {
        "server.port": "8000",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
    }
