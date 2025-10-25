from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
import uuid
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt

from .models import EmailVerificationToken
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import EmailVerificationToken
from .utils import publish_event

User = get_user_model()


# ---------------------------
# AUTHENTIFICATION & PROFIL
# ---------------------------
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        # Publier un événement (RabbitMQ)
        publish_event('user_created', {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'created_at': user.date_joined.isoformat()
        })

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)



User = get_user_model()


# ----------------------------
# 1️⃣ Demande de réinitialisation de mot de passe
# ----------------------------

# @api_view(['POST'])
# @permission_classes([])

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    L’utilisateur envoie son email.
    On génère un token temporaire et on envoie un lien de réinitialisation.
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Aucun utilisateur trouvé avec cet email.'}, status=status.HTTP_404_NOT_FOUND)

    # Générer un token unique pour la réinitialisation
    token = str(uuid.uuid4())
    expires_at = timezone.now() + timedelta(hours=1)

    EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

    reset_url = f"http://127.0.0.1:8000/api/password-reset-confirm/{token}/"

    try:
        send_mail(
            subject="Réinitialisation de votre mot de passe",
            message=f"Bonjour {user.username},\n\n"
                    f"Utilisez le lien suivant pour définir un nouveau mot de passe : {reset_url}\n\n"
                    f"Ce lien expirera dans 1 heure.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({'error': f"Erreur d’envoi d’email : {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'Email de réinitialisation envoyé avec succès.'}, status=status.HTTP_200_OK)


# ----------------------------
# 2️⃣ Confirmation de réinitialisation
# ----------------------------

# @api_view(['POST'])
# @permission_classes([])
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])

def password_reset_confirm(request, token):
    """
    L’utilisateur fournit le token et un nouveau mot de passe.
    Si le token est valide et non expiré, on met à jour le mot de passe.
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_password = serializer.validated_data['new_password']

    try:
        reset_token = EmailVerificationToken.objects.get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response({'error': 'Token invalide ou déjà utilisé.'}, status=status.HTTP_404_NOT_FOUND)

    # Vérification expiration
    if reset_token.expires_at < timezone.now():
        reset_token.delete()
        return Response({'error': 'Le lien de réinitialisation a expiré.'}, status=status.HTTP_400_BAD_REQUEST)

    # Mettre à jour le mot de passe
    user = reset_token.user
    user.set_password(new_password)
    user.save()

    # Supprimer le token après utilisation
    reset_token.delete()

    return Response({'message': 'Mot de passe réinitialisé avec succès.'}, status=status.HTTP_200_OK)




class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, token):
        token_obj = get_object_or_404(EmailVerificationToken, token=token)
        if token_obj.expires_at < timezone.now():
            return Response({'detail': 'Token expiré'}, status=status.HTTP_400_BAD_REQUEST)
        user = token_obj.user
        user.is_verified = True
        user.save()
        token_obj.delete()
        return Response({'detail': 'Email vérifié avec succès'}, status=status.HTTP_200_OK)


# ---------------------------
# CRUD COMPLET SUR LES USERS
# ---------------------------

class UserListCreateView(generics.ListCreateAPIView):
    """
    - GET → liste des utilisateurs
    - POST → créer un utilisateur (admin)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'role']
    ordering_fields = ['date_joined', 'email']
    ordering = ['-date_joined']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]  # seuls les admins peuvent créer manuellement un user
        return [IsAuthenticated()]


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    - GET → récupérer un utilisateur par ID
    - PUT/PATCH → modifier un utilisateur
    - DELETE → supprimer un utilisateur
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Seuls les admins ou le propriétaire peuvent modifier / supprimer
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not (self.request.user.is_superuser or self.request.user.is_staff):
                self.permission_denied(self.request, message="Non autorisé.")
        return super().get_permissions()

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user_id = user.id
        response = super().delete(request, *args, **kwargs)
        # Publier un événement de suppression
        publish_event('user_deleted', {'user_id': user_id})
        return response
