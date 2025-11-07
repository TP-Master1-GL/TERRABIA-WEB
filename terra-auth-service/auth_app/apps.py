from django.apps import AppConfig
import threading, time, socket, logging
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

class AuthAppConfig(AppConfig):
    name = 'auth_app'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        if hasattr(self, "_threads_started"):
            return
        self._threads_started = True

        logger.info("[Django] Démarrage des threads : Eureka + RabbitMQ")

        # Threads
        threading.Thread(target=self._register_eureka, daemon=True).start()
        threading.Thread(target=start_consumer, daemon=True).start()

    def _register_eureka(self):
        time.sleep(5)
        try:
            config = get_app_config()  # utilise la même config que manage.py
            port = config.get("server.port", "8000")
            eureka_url = config.get("eureka.client.serviceUrl.defaultZone", "").rstrip("/")
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

            import requests
            resp = requests.post(f"{eureka_url}/apps/TERRA-AUTH-SERVICE",
                                 json=payload,
                                 headers={"Content-Type": "application/json"},
                                 timeout=10)
            status = "OK" if resp.status_code in [200, 204] else f"ÉCHEC {resp.status_code}"
            logger.info(f"[Eureka] Enregistré : {instance_id} → {status}")

        except Exception as e:
            logger.error(f"[Eureka] Erreur : {e}")
