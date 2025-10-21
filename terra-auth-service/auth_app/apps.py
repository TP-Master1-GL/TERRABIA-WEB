from django.apps import AppConfig
import requests
import os

class AuthAppConfig(AppConfig):
    name = 'auth_app'
    
    def ready(self):
        try:
            response = requests.post(
                f"{os.getenv('REGISTRY_SERVICE_URL', 'http://localhost:8082')}/registry/register",
                json={"serviceName": "terra-auth-service", "host": "localhost", "port": 8000}
            )
            if response.status_code != 200:
                print("Erreur enregistrement service")
        except Exception as e:
            print(f"Erreur enregistrement: {e}")