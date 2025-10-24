# auth_app/config.py
import requests
import os
import time

def get_config():
    url = os.getenv("CONFIG_SERVICE_URL", "http://localhost:8080")
    max_retries = 5
    for i in range(max_retries):
        try:
            resp = requests.get(f"{url}/terra-auth-service/default", timeout=5)
            if resp.status_code == 200:
                source = resp.json()["propertySources"][0]["source"]
                print("Config récupérée depuis terra-conf-service")
                return source
        except Exception as e:
            print(f"Tentative {i+1}/{max_retries} : Config Server indisponible → {e}")
        time.sleep(2)
    # Config par défaut
    print("Config Server indisponible → utilisation des valeurs par défaut")
    return {
        "server.port": "8000",
        "auth.jwt_secret": "fallback-secret-key-2025",
        "auth.jwt_expiration": "900",
        "auth.refresh_expiration": "7",
        "eureka.client.serviceUrl.defaultZone": "http://localhost:8761/eureka/"
    }