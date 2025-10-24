# auth_app/views.py
from django.http import JsonResponse
from rest_framework.views import APIView
from .models import User, RefreshToken, BlacklistToken
import jwt, bcrypt, uuid
from datetime import datetime, timedelta
from .config import get_config


class LoginView(APIView):
    def post(self, request):
        config = get_config()
        email = request.data.get("email")
        password = request.data.get("motDePasse")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        if not bcrypt.checkpw(password.encode(), user.mot_de_passe.encode()):
            return JsonResponse({"error": "Identifiants invalides"}, status=401)

        payload = {
            "user_id": str(user.id),
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(seconds=int(config["auth.jwt_expiration"]))
        }
        access_token = jwt.encode(payload, config["auth.jwt_secret"], algorithm="HS256")
        refresh_token = str(uuid.uuid4())
        RefreshToken.objects.create(
            token=refresh_token,
            user=user,
            expiration=datetime.utcnow() + timedelta(days=int(config["auth.refresh_expiration"]))
        )

        return JsonResponse({
            "accessToken": access_token,
            "refreshToken": refresh_token
        })

class RefreshView(APIView):
    def post(self, request):
        config = get_config()
        rt = RefreshToken.objects.filter(token=request.data.get("refreshToken")).first()
        if not rt or rt.expiration < datetime.utcnow():
            return JsonResponse({"error": "Token invalide"}, status=401)

        payload = {
            "user_id": str(rt.user.id),
            "role": rt.user.role,
            "exp": datetime.utcnow() + timedelta(seconds=int(config["auth.jwt_expiration"]))
        }
        return JsonResponse({"accessToken": jwt.encode(payload, config["auth.jwt_secret"], "HS256")})

class ValidateView(APIView):
    def get(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config["auth.jwt_secret"], algorithms=["HS256"])
            if BlacklistToken.objects.filter(token=token).exists():
                raise jwt.InvalidTokenError
            return JsonResponse({"valide": True, "user_id": payload["user_id"], "role": payload["role"]})
        except:
            return JsonResponse({"valide": False}, status=401)

class LogoutView(APIView):
    def post(self, request):
        config = get_config()
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, config["auth.jwt_secret"], algorithms=["HS256"])
            BlacklistToken.objects.create(token=token, expiration=datetime.fromtimestamp(payload["exp"]))
            RefreshToken.objects.filter(user__id=payload["user_id"]).delete()
            return JsonResponse({"message": "Déconnexion réussie"})
        except:
            return JsonResponse({"error": "Token invalide"}, status=401)