# users/apps.py
from django.apps import AppConfig
import threading
import time
import socket
import requests
import os
import sys
import logging
from .config_loader import get_app_config
from .rabbitmq_consumer import start_consumer

logger = logging.getLogger(__name__)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

class UsersConfig(AppConfig):
    name = 'users'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        # Éviter double lancement (Django recharge parfois ready())
        if hasattr(self, '_threads_started'):
            return
        self._threads_started = True

        # Désactiver en mode test
        if 'pytest' in sys.modules or os.environ.get('RUN_MAIN') or 'test' in sys.argv:
            logger.info("[Users] Mode test détecté → Eureka & RabbitMQ désactivés")
            return

        logger.info("[Users] Démarrage des threads background (Eureka + RabbitMQ)")

        # Thread Eureka
        threading.Thread(target=self._register_eureka, daemon=True).start()

        # Thread RabbitMQ (même si silencieux pour l’instant)
        threading.Thread(target=start_consumer, daemon=True).start()

    def _register_eureka(self):
        time.sleep(8)  # laisser le temps au serveur de démarrer
        try:
            config = get_app_config()
            eureka_url = config.get("eureka.client.serviceUrl.defaultZone", "http://localhost:8761/eureka/").rstrip("/")
            port = config.get("server.port", "8082")
            ip_addr = get_local_ip()
            instance_id = f"{ip_addr}:{port}"

            payload = {
                "instance": {
                    "instanceId": instance_id,
                    "hostName": ip_addr,
                    "app": "TERRA-USERS-SERVICE",
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
                f"{eureka_url}/apps/TERRA-USERS-SERVICE",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            status = "OK" if resp.status_code in [200, 204] else f"ÉCHEC {resp.status_code}"
            logger.info(f"[Eureka] TERRA-USERS-SERVICE enregistré → {instance_id} | {status}")

        except Exception as e:
            logger.error(f"[Eureka] Erreur enregistrement Users : {e}")