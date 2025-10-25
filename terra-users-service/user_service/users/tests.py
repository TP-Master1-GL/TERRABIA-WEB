from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from unittest.mock import patch
from .models import EmailVerificationToken
import uuid
from datetime import timedelta

User = get_user_model()


class UserEndpointsAdvancedTest(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Superuser pour tests CRUD
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            password="Admin123!"
        )

        # Création de plusieurs utilisateurs de rôles différents
        self.acheteur = User.objects.create_user(
            email="acheteur@example.com",
            username="acheteur",
            password="Acheteur123!",
            role="acheteur"
        )
        self.vendeur = User.objects.create_user(
            email="vendeur@example.com",
            username="vendeur",
            password="Vendeur123!",
            role="vendeur"
        )
        self.livreur = User.objects.create_user(
            email="livreur@example.com",
            username="livreur",
            password="Livreur123!",
            role="entreprise_livraison"
        )

    # ---------------------
    # Test Inscription et vérification email
    # ---------------------
    @patch('users.serializers.send_mail')
    def test_register_and_verify_email(self, mock_send):
        mock_send.return_value = 1

        url = reverse('register')
        data = {"email": "newuser@example.com", "username": "newuser", "password": "Test1234!"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_user = User.objects.get(email="newuser@example.com")
        self.assertFalse(new_user.is_verified)
        mock_send.assert_called_once()

        # Vérifier email
        token_obj = EmailVerificationToken.objects.get(user=new_user)
        url_verify = reverse('verify-email', args=[token_obj.token])
        response = self.client.get(url_verify)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        new_user.refresh_from_db()
        self.assertTrue(new_user.is_verified)

    # ---------------------
    # Test Login pour tous les rôles
    # ---------------------
    def test_login_all_roles(self):
        for user, pwd in [(self.acheteur, "Acheteur123!"), (self.vendeur, "Vendeur123!"), (self.livreur, "Livreur123!")]:
            url = reverse('login')
            data = {"email": user.email, "password": pwd}
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('access', response.data)

    # ---------------------
    # Test CRUD admin vs utilisateurs normaux
    # ---------------------
    def test_user_crud_permissions(self):
        # Un utilisateur normal ne peut pas créer d'autres utilisateurs
        self.client.force_authenticate(user=self.acheteur)
        url_list = reverse('user-list')
        data = {"email": "illegal@example.com", "username": "illegal"}
        response = self.client.post(url_list, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin peut créer un utilisateur
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(url_list, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_id = response.data['id']

        # Un utilisateur normal ne peut pas supprimer un autre utilisateur
        self.client.force_authenticate(user=self.vendeur)
        url_detail = reverse('user-detail', args=[user_id])
        response = self.client.delete(url_detail)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin peut supprimer
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(url_detail)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # ---------------------
    # Test Liste et filtrage
    # ---------------------
    def test_user_list_filter(self):
        self.client.force_authenticate(user=self.admin_user)
        url_list = reverse('user-list')
        response = self.client.get(url_list + '?search=vendeur')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(u['email'] == 'vendeur@example.com' for u in response.data))

    # ---------------------
    # Test Réinitialisation mot de passe avec mock email
    # ---------------------
    @patch('users.views.send_mail')
    def test_password_reset_flow(self, mock_send):
        mock_send.return_value = 1

        # 1️⃣ Demande reset
        url_request = reverse('password_reset_request')
        response = self.client.post(url_request, {"email": self.acheteur.email}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token_obj = EmailVerificationToken.objects.get(user=self.acheteur)
        self.assertIsNotNone(token_obj)

        # 2️⃣ Confirmer reset
        url_confirm = reverse('password_reset_confirm', args=[token_obj.token])
        data = {"token": token_obj.token, "new_password": "NewPass123!"}
        response = self.client.post(url_confirm, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.acheteur.refresh_from_db()
        self.assertTrue(self.acheteur.check_password("NewPass123!"))
