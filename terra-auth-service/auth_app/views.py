# auth_app/views.py
from django.http import JsonResponse
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import User, RefreshToken, BlacklistToken
import jwt, bcrypt, uuid
from datetime import timedelta
from .config import get_config
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# === Schémas Swagger ===
login_request = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email de l\'utilisateur'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='Mot de passe en clair'),
    },
    required=['email', 'password']
)

token_response = openapi.Response(
    description="Tokens JWT",
    schema=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'accessToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token d\'accès (15min)'),
            'refreshToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token de rafraîchissement (7j)'),
        }
    )
)


class LoginView(APIView):
    @swagger_auto_schema(
        request_body=login_request,
        responses={
            200: token_response,
            400: "Champs requis manquants",
            401: "Identifiants invalides",
            403: "Utilisateur inactif"
        },
        operation_summary="Connexion utilisateur",
        operation_description="Retourne un accessToken et refreshToken JWT"
    )
    def post(self, request):
        config = get_config()

        email = request.data.get("email")
        password = request.data.get("password")

        # Vérifie les champs obligatoires
        if not email or not password:
            return JsonResponse({"error": "Champs requis manquants"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        # Vérifie si l'utilisateur est actif
        if not getattr(user, "is_active", True):
            return JsonResponse({"error": "Utilisateur inactif"}, status=403)

        # Vérification du mot de passe
        if not bcrypt.checkpw(password.encode(), user.password.encode()):
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        # Génération du token d’accès
        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": timezone.now() + timedelta(seconds=int(config["auth.jwt_expiration"]))
        }
        access_token = jwt.encode(payload, config["auth.jwt_secret"], algorithm="HS256")

        # Génération du refresh token
        refresh_token = str(uuid.uuid4())
        RefreshToken.objects.create(
            token=refresh_token,
            user=user,
            expiration=timezone.now() + timedelta(days=int(config["auth.refresh_expiration"]))
        )

        return JsonResponse({
            "accessToken": access_token,
            "refreshToken": refresh_token
        })


class RefreshView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refreshToken': openapi.Schema(type=openapi.TYPE_STRING, description='Token de rafraîchissement')
            },
            required=['refreshToken']
        ),
        responses={
            200: openapi.Response("Nouveau accessToken", openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={'accessToken': openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            401: "Token invalide"
        },
        operation_summary="Rafraîchir le token",
        operation_description="Génère un nouveau accessToken à partir du refreshToken"
    )
    def post(self, request):
        refresh_token_str = request.data.get("refreshToken")
        if not refresh_token_str:
            return JsonResponse({"error": "Refresh token manquant"}, status=400)

        # Vérification blacklist
        if BlacklistToken.objects.filter(token=refresh_token_str).exists():
            return JsonResponse({"error": "Token invalide ou blacklisté"}, status=401)

        rt = RefreshToken.objects.filter(token=refresh_token_str).first()
        if not rt or rt.is_expired():
            return JsonResponse({"error": "Token invalide ou expiré"}, status=401)

        user = rt.user
        config = get_config()
        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": timezone.now() + timedelta(seconds=int(config["auth.jwt_expiration"]))
        }
        access_token = jwt.encode(payload, config["auth.jwt_secret"], algorithm="HS256")

        return JsonResponse({"accessToken": access_token})


class ValidateView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer <accessToken>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response("Token valide", openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'valide': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'user_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'role': openapi.Schema(type=openapi.TYPE_STRING, enum=['acheteur', 'vendeur', 'admin'])
                }
            )),
            401: "Token invalide"
        },
        operation_summary="Valider un token",
        operation_description="Vérifie si le token JWT est valide"
    )
    def get(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config["auth.jwt_secret"], algorithms=["HS256"])
            if BlacklistToken.objects.filter(token=token).exists():
                return JsonResponse({"valide": False, "error": "Token blacklisté"}, status=401)
            return JsonResponse({"valide": True, "user_id": payload["user_id"], "role": payload["role"]})
        except jwt.ExpiredSignatureError:
            return JsonResponse({"valide": False, "error": "Token expiré"}, status=401)
        except Exception:
            return JsonResponse({"valide": False, "error": "Token invalide"}, status=401)


class LogoutView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer <accessToken>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: "Déconnexion réussie",
            401: "Token invalide"
        },
        operation_summary="Déconnexion",
        operation_description="Invalide le token et supprime le refresh token"
    )
    def post(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config["auth.jwt_secret"], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expiré"}, status=401)
        except Exception:
            return JsonResponse({"error": "Token invalide"}, status=401)

        # Vérifier si le token est déjà blacklisté
        if BlacklistToken.objects.filter(token=token).exists():
            return JsonResponse({"message": "Token déjà invalidé"}, status=200)

        # Ajouter le token à la blacklist
        BlacklistToken.objects.create(
            token=token,
            expiration=timezone.now() + timedelta(seconds=int(config["auth.jwt_expiration"]))
        )
        # Supprimer tous les refresh tokens associés
        RefreshToken.objects.filter(user__id=payload["user_id"]).delete()

        return JsonResponse({"message": "Déconnexion réussie"})
