# product_app/apps.py
from django.apps import AppConfig
import threading
import time
import requests
import logging
import socket

from .config_loader import get_app_config
# from .rabbitmq_consumer import start_consumer  # Décommenter si RabbitMQ utilisé

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_local_ip():
    """Retourne l'adresse IP locale réelle de la machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class ProductAppConfig(AppConfig):
    name = 'product_app'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        """
        Évite le lancement multiple des threads (Django reload multiple apps).
        """
        if hasattr(self, '_threads_started'):
            return

        self._threads_started = True
        logger.info("[Django] 🚀 Démarrage des threads → Eureka (et RabbitMQ si activé)")

        # Thread Eureka
        threading.Thread(target=self._register_eureka, daemon=True).start()

        # Thread RabbitMQ (désactivé pour l'instant)
        # threading.Thread(target=start_consumer, daemon=True).start()

    def _register_eureka(self):
        """
        Enregistre le service auprès de Eureka.
        """
        time.sleep(5)  # Laisser le temps à Django de démarrer

        try:
            config = get_app_config()  # récup config service
            eureka_url = config.get("eureka.client.serviceUrl.defaultZone", "").rstrip("/")
            port = config.get("server.port", "8000")
            ip_addr = get_local_ip()
            instance_id = f"{ip_addr}:{port}"

            payload = {
                "instance": {
                    "instanceId": instance_id,
                    "hostName": ip_addr,
                    "app": "TERRA-PRODUCT-SERVICE",
                    "ipAddr": ip_addr,
                    "port": {"$": int(port), "@enabled": True},
                    "status": "UP",
                    "dataCenterInfo": {
                        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                        "name": "MyOwn"
                    },
                    "metadata": {"instanceId": instance_id}
                }
            }

            resp = requests.post(
                f"{eureka_url}/apps/TERRA-PRODUCT-SERVICE",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )

            if resp.status_code in (200, 204):
                logger.info(f"[Eureka] ✅ Enregistré : {instance_id}")
            else:
                logger.warning(f"[Eureka] ⚠ Enregistrement partiel : status={resp.status_code}")

        except Exception as e:
            logger.error(f"[Eureka] ❌ Erreur d’enregistrement : {e}")
