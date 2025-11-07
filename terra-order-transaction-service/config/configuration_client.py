import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class ConfigurationClient:
    """Client pour récupérer la configuration depuis le service de configuration"""
    
    @staticmethod
    def get_config_value(key, default=None):
        try:
            response = requests.get(
                f"{settings.MICROSERVICES['config_service']}/config/{key}",
                timeout=5
            )
            if response.status_code == 200:
                return response.json().get('value', default)
            return default
        except requests.RequestException as e:
            logger.warning(f"Could not fetch config {key} from config service: {str(e)}")
            return default
    
    @staticmethod
    def refresh_configuration():
        """Rafraîchir la configuration depuis le service de configuration"""
        try:
            # Récupérer toutes les configurations pour ce service
            response = requests.get(
                f"{settings.MICROSERVICES['config_service']}/config/service/terra-order-transaction-service",
                timeout=10
            )
            if response.status_code == 200:
                config_data = response.json()
                logger.info("Configuration refreshed successfully")
                return config_data
            return None
        except requests.RequestException as e:
            logger.error(f"Error refreshing configuration: {str(e)}")
            return None

class EurekaClient:
    """Client pour s'enregistrer auprès d'Eureka Server"""
    
    @staticmethod
    def register_with_eureka():
        """S'enregistrer auprès du service Eureka"""
        try:
            import socket
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
            
            registration_data = {
                "instance": {
                    "instanceId": f"terra-order-transaction-service:{settings.SERVICE_PORT}",
                    "app": "TERRA-ORDER-TRANSACTION-SERVICE",
                    "appGroupName": "TERRABIA-MICROSERVICES",
                    "ipAddr": ip_address,
                    "status": "UP",
                    "port": {
                        "$": settings.SERVICE_PORT,
                        "@enabled": "true"
                    },
                    "securePort": {
                        "$": 8443,
                        "@enabled": "false"
                    },
                    "countryId": 1,
                    "dataCenterInfo": {
                        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                        "name": "MyOwn"
                    },
                    "hostName": hostname,
                    "vipAddress": "terra-order-transaction-service",
                    "secureVipAddress": "terra-order-transaction-service",
                    "healthCheckUrl": f"http://{ip_address}:{settings.SERVICE_PORT}/health/",
                    "statusPageUrl": f"http://{ip_address}:{settings.SERVICE_PORT}/admin/",
                    "homePageUrl": f"http://{ip_address}:{settings.SERVICE_PORT}/",
                    "metadata": {
                        "version": "1.0.0",
                        "description": "Order and Transaction Service for Terrabia"
                    }
                }
            }
            
            response = requests.post(
                f"{settings.MICROSERVICES['eureka_service']}/apps/TERRA-ORDER-TRANSACTION-SERVICE",
                json=registration_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                logger.info("Successfully registered with Eureka")
                return True
            else:
                logger.error(f"Failed to register with Eureka: {response.status_code}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"Error registering with Eureka: {str(e)}")
            return False
    
    @staticmethod
    def send_heartbeat():
        """Envoyer un heartbeat à Eureka"""
        try:
            response = requests.put(
                f"{settings.MICROSERVICES['eureka_service']}/apps/TERRA-ORDER-TRANSACTION-SERVICE/"
                f"terra-order-transaction-service:{settings.SERVICE_PORT}",
                timeout=5
            )
            return response.status_code in [200, 204]
        except requests.RequestException:
            return False
    
    @staticmethod
    def unregister_from_eureka():
        """Se désenregistrer d'Eureka"""
        try:
            response = requests.delete(
                f"{settings.MICROSERVICES['eureka_service']}/apps/TERRA-ORDER-TRANSACTION-SERVICE/"
                f"terra-order-transaction-service:{settings.SERVICE_PORT}",
                timeout=5
            )
            return response.status_code in [200, 204]
        except requests.RequestException as e:
            logger.error(f"Error unregistering from Eureka: {str(e)}")
            return False