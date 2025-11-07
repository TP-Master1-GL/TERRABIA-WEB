# users/config.py
import requests
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_config(service_name="terra-users-service"):
    """
    Récupère la configuration depuis le serveur de configuration central (terra-conf-service).
    Si le serveur est indisponible après plusieurs tentatives,
    retourne une configuration par défaut pour assurer la résilience du service.
    """
    url = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
    max_retries = 5

    for i in range(max_retries):
        try:
            resp = requests.get(f"{url}/{service_name}/default", timeout=5)
            if resp.status_code == 200:
                source = resp.json()["propertySources"][0]["source"]
                logger.info("✅ Config récupérée depuis terra-conf-service")
                return source
        except Exception as e:
            logger.warning(f"Tentative {i+1}/{max_retries} : Config Server indisponible → {e}")
        time.sleep(2)

    # === CONFIG PAR DÉFAUT ===
    logger.warning("⚠️ Config Server indisponible → utilisation des valeurs par défaut")

    DEFAULT_CONFIG = {
        "server.port": "8082",
        "spring.application.name": "terra-users-service",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
        "eureka.instance.preferIpAddress": "true",
        "eureka.instance.instanceId": "127.0.0.1:8082",

        # Base de données par défaut (à adapter selon ton environnement)
        "spring.datasource.url": "jdbc:postgresql://localhost:5432/terra_users_db",
        "spring.datasource.username": "postgres",
        "spring.datasource.password": "postgres",
        "spring.datasource.driver-class-name": "org.postgresql.Driver",

        # Sécurité JWT (même secret que le service auth pour la vérification)
        "security.jwt.secret": "super-secret-terrabia-2025",
        "security.jwt.prefix": "Bearer ",
        "security.jwt.header": "Authorization"
    }

    return DEFAULT_CONFIG


def get_fake_config():
    """Configuration factice pour les tests unitaires."""
    return {
        "server.port": "8082",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/",
        "security.jwt.secret": "test-secret-users-2025",
    }

