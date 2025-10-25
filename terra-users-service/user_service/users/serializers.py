from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EmailVerificationToken
import uuid
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


# ----------------------------
# UTILISATEUR GÉNÉRIQUE
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'role',
            'phone_number',
            'address',
            'is_verified',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['is_verified', 'date_joined', 'is_active']


# ----------------------------
# INSCRIPTION (REGISTER)
# ----------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'password',
            'role',
            'phone_number',
            'address',
        ]

    def create(self, validated_data):
        # Création de l’utilisateur
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'acheteur'),
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', '')
        )

        # Génération du token de vérification
        token = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(hours=24)
        EmailVerificationToken.objects.create(
            user=user, token=token, expires_at=expires_at
        )

        # Envoi de l’email de vérification
        verification_url = f"http://127.0.0.1:8000/api/verify-email/{token}/"
        try:
            send_mail(
                subject='Vérifiez votre adresse email',
                message=f'Bonjour {user.username or ""},\n\n'
                        f'Cliquez sur ce lien pour vérifier votre email : {verification_url}\n\n'
                        'Ce lien expire dans 24h.',
                from_email='delphantsabeng13@gmail.com',  # expéditeur
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Erreur d’envoi d’email : {e}")

        return user


# ----------------------------
# CONNEXION (LOGIN)
# ----------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )


# ----------------------------
# RÉINITIALISATION DE MOT DE PASSE
# ----------------------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(
        style={'input_type': 'password'},
        min_length=8,
        write_only=True
    )
