from rest_framework import authentication
from rest_framework import exceptions
import jwt
from django.conf import settings

class MicroserviceAuthentication(authentication.BaseAuthentication):
    """Authentification pour les microservices"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            # Vérifier le token JWT
            token = auth_header.split(' ')[1]  # "Bearer <token>"
            
            # Dans un environnement de production, vous vérifieriez le token
            # avec le service d'authentification
            decoded = jwt.decode(token, options={"verify_signature": False})
            
            user_id = decoded.get('user_id')
            user_role = decoded.get('role')
            
            if not user_id:
                raise exceptions.AuthenticationFailed('Invalid token')
            
            # Créer un utilisateur factice pour Django
            from django.contrib.auth.models import User
            user = User(username=user_id)
            user.user_id = user_id
            user.role = user_role
            
            return (user, None)
            
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except IndexError:
            raise exceptions.AuthenticationFailed('Token prefix missing')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication error: {str(e)}')

class ServiceToServiceAuthentication:
    """Authentification pour la communication entre services"""
    
    @staticmethod
    def get_service_token():
        # Générer un token pour l'authentification entre services
        import jwt
        import datetime
        
        payload = {
            'service_name': 'terra-order-transaction-service',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token
    
    @staticmethod
    def get_headers():
        return {
            'Authorization': f'Bearer {ServiceToServiceAuthentication.get_service_token()}',
            'Content-Type': 'application/json'
        }