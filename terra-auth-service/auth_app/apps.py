# auth_app/apps.py
from django.apps import AppConfig
import socket
import threading
import time
import requests
from .config import get_config
from .rabbitmq_consumer import start_consumer


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
        # Éviter double lancement
        if hasattr(self, '_threads_started'):
            return
        self._threads_started = True

        eureka_thread = threading.Thread(target=self._register_eureka, daemon=True)
        eureka_thread.start()

        rabbitmq_thread = threading.Thread(target=start_consumer, daemon=True)
        rabbitmq_thread.start()

        print("[Django] Threads lancés : Eureka + RabbitMQ")

    def _register_eureka(self):
        time.sleep(5)
        try:
            config = get_config()
            eureka_url = config["eureka.client.serviceUrl.defaultZone"].rstrip("/")
            port = config["server.port"]
            ip_addr = get_local_ip()

            payload = {
                "instance": {
                    "instanceId": f"terra-auth-service:{ip_addr}:{port}",
                    "hostName": ip_addr,
                    "app": "terra-auth-service",
                    "ipAddr": ip_addr,
                    "port": {"$": int(port), "@enabled": True},
                    "status": "UP",
                    "dataCenterInfo": {
                        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                        "name": "MyOwn"
                    }
                }
            }

            # CORRIGÉ : timeout (pas timeoutillis)
            resp = requests.post(
                f"{eureka_url}/apps/terra-auth-service",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10  # ← CORRECT
            )
            status = "OK" if resp.status_code in [200, 204] else f"ÉCHEC {resp.status_code}"
            print(f"[Eureka] Enregistré : {ip_addr}:{port} → {status}")
        except Exception as e:
            print(f"[Eureka] Erreur : {e}")