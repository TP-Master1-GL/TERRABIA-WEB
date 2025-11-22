# auth_app/config.py
import os
import time
import logging
import requests
from dotenv import load_dotenv

# Charger automatiquement les variables du .env
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_config(service_name="terra-auth-service"):
    """
    Récupère la configuration depuis le config-server.
    Sinon fallback sur un mélange : valeurs .env + valeurs codées par défaut.
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

    logger.warning("Config Server indisponible → utilisation `.env` + fallback par défaut")

    # Fallback avec valeurs du .env
    DEFAULT_CONFIG = {
        "server.port": os.getenv("SERVER_PORT", "8000"),
        "auth.jwt_secret": os.getenv("AUTH_JWT_SECRET", "fallback-secret-key-2025"),
        "auth.jwt_expiration": os.getenv("AUTH_JWT_EXPIRATION", "900"),
        "auth.refresh_expiration": os.getenv("AUTH_REFRESH_EXPIRATION", "7"),
        "eureka.client.serviceUrl.defaultZone": os.getenv(
            "EUREKA_DEFAULT_ZONE",
            "http://localhost:8761/eureka/"
        )
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
