import requests
import json

def test_config_service():
    service_name = "terra-order-transaction-service"  # ⬅️ CORRIGEZ ICI
    profile = "dev"
    config_url = f"http://localhost:8080/{service_name}-{profile}.json"
    
    print(f"🔧 Test de configuration sur: {config_url}")
    
    try:
        response = requests.get(config_url, timeout=5)
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            config_data = response.json()
            print("📋 Configuration reçue:")
            print(json.dumps(config_data, indent=4))
            
            # Vérifiez les champs importants
            print(f"\n🔍 Champs importants:")
            print(f"   Port: {config_data.get('server', {}).get('port')}")
            print(f"   Secret Key: {config_data.get('secret_key', 'NON TROUVÉ')}")
            print(f"   Database: {config_data.get('database', {}).get('name', 'NON TROUVÉ')}")
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            print(f"   Réponse: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Timeout: Le service de configuration ne répond pas")
        print("   Vérifiez que le service Spring Boot Config est démarré sur le port 8080")
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Impossible de se connecter au service de configuration")
        print("   Vérifiez l'URL et que le service est démarré")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_config_service()