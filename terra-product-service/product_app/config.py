import requests
import time
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_config(service_name="terra-product-service"):
    """
    Récupère la configuration auprès du Config Server.
    En cas d'échec, retourne une configuration minimale incluant server.port.
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

    # ---- Fallback minimal avec server.port ----
    logger.warning("⚠️ Config Server indisponible → fallback minimal activé")
    return {
        "server.port": "8000",
        "eureka.client.serviceUrl.defaultZone": os.getenv(
            "EUREKA_URL", "http://localhost:8761/eureka/"
        )
    }


def get_fake_config():
    """
    Configuration factice pour les tests.
    Reproduit exactement la structure attendue.
    """
    return {
        "server.port": "8000",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
    }
