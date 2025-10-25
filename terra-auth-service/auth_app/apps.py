# auth_app/apps.py
from django.apps import AppConfig
import socket
import threading
import time
import requests
import os
import sys
from .config import get_config
from .rabbitmq_consumer import start_consumer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_local_ip():
    """Récupère l'IP locale accessible par les autres services."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class AuthAppConfig(AppConfig):
    name = 'auth_app'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        # === PROTECTION CONTRE LES TESTS ===
        if (
            'pytest' in sys.modules or
            'PYTEST_CURRENT_TEST' in os.environ or
            'RUN_MAIN' in os.environ or
            os.environ.get('DJANGO_SETTINGS_MODULE', '').endswith('.test')
        ):
            logger.info("[TEST MODE] Eureka & RabbitMQ désactivés")
            return

        # === ÉVITER DOUBLE LANCEMENT ===
        if hasattr(self, '_threads_started'):
            return
        self._threads_started = True

        logger.info("[Django] Démarrage des threads : Eureka + RabbitMQ")

        eureka_thread = threading.Thread(target=self._register_eureka, daemon=True)
        eureka_thread.start()

        rabbitmq_thread = threading.Thread(target=start_consumer, daemon=True)
        rabbitmq_thread.start()

    def _register_eureka(self):
        time.sleep(8)
        try:
            config = get_config()
            eureka_url = config["eureka.client.serviceUrl.defaultZone"].rstrip("/")
            port = config["server.port"]
            ip_addr = get_local_ip()

            instance_id = f"{ip_addr}:{port}"

            payload = {
                "instance": {
                    "instanceId": instance_id,
                    "hostName": ip_addr,
                    "app": "TERRA-AUTH-SERVICE",
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
                f"{eureka_url}/apps/TERRA-AUTH-SERVICE",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )

            status = "OK" if resp.status_code in [200, 204] else f"ÉCHEC {resp.status_code}"
            logger.info(f"[Eureka] Enregistré : {instance_id} → {status}")

        except Exception as e:
            print(f"[Eureka] Erreur : {e}")