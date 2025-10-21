import requests
import os

def get_config():
    response = requests.get(
        f"{os.getenv('CONFIG_SERVICE_URL', 'http://localhost:8080')}/config/auth"
    )
    if response.status_code != 200:
        raise Exception("Erreur récupération config")
    return response.json()  # Ex. : {"jwt_secret": "secret", "jwt_expiration": 900, "refresh_expiration": 7}