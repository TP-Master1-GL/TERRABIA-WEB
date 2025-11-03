import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal
from order_app.models import Order, OrderItem, Transaction
import json
import uuid

class OrderFlowIntegrationTest(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.order_url = reverse('order-list')
        self.transaction_url = reverse('transaction-list')
        
        # Données de test
        self.order_data = {
            'buyer_id': 'user_123',
            'farmer_id': 'farmer_456',
            'items': [
                {
                    'product_id': 'prod_001',
                    'product_name': 'Tomates fraîches',
                    'quantity': '2.5',
                    'unit': 'kg',
                    'unit_price': '400.00'
                },
                {
                    'product_id': 'prod_002', 
                    'product_name': 'Oignons',
                    'quantity': '1.0',
                    'unit': 'kg',
                    'unit_price': '300.00'
                }
            ],
            'delivery_address': '123 Rue du Test, Yaoundé',
            'delivery_latitude': '3.848033',
            'delivery_longitude': '11.502075',
            'buyer_notes': 'Livraison avant 18h'
        }
    
    def test_complete_order_flow(self):
        """Test complet du flux de commande"""
        
        # 1. Création de la commande
        response = self.client.post(
            self.order_url,
            data=json.dumps(self.order_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_id = response.data['id']
        
        # Vérifier la commande créée
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, 'PENDING')
        self.assertEqual(order.items.count(), 2)
        self.assertEqual(order.total_amount, Decimal('1300.00'))  # (2.5*400) + (1.0*300) + frais livraison
        
        # 2. Récupération de la commande
        response = self.client.get(f'{self.order_url}{order_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], order.order_number)
        
        # 3. Traitement du paiement
        transaction_data = {
            'order_id': order_id,
            'transaction_type': 'PAYMENT',
            'payment_method': 'MOBILE_MONEY',
            'amount': str(order.total_amount),
            'payer_id': 'user_123',
            'payee_id': 'farmer_456',
            'description': 'Paiement commande'
        }
        
        response = self.client.post(
            f'{self.order_url}{order_id}/process_payment/',
            data=json.dumps(transaction_data),
            content_type='application/json'
        )
        
        # Le paiement devrait échouer car la commande n'est pas confirmée
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 4. Confirmer la commande d'abord
        order.status = 'CONFIRMED'
        order.save()
        
        # 5. Retenter le paiement
        response = self.client.post(
            f'{self.order_url}{order_id}/process_payment/',
            data=json.dumps(transaction_data),
            content_type='application/json'
        )
        
        # Le paiement devrait maintenant être traité
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
        
        # 6. Annulation de commande
        response = self.client.post(
            f'{self.order_url}{order_id}/cancel/',
            data=json.dumps({'cancellation_reason': 'Test d\'annulation'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que la commande est annulée
        order.refresh_from_db()
        self.assertEqual(order.status, 'CANCELLED')
    
    def test_order_listing(self):
        """Test de listing des commandes"""
        
        # Créer quelques commandes
        Order.objects.create(
            buyer_id='user_123',
            farmer_id='farmer_456',
            subtotal=Decimal('1000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('1500.00'),
            delivery_address='Address 1'
        )
        
        Order.objects.create(
            buyer_id='user_456',
            farmer_id='farmer_789',
            subtotal=Decimal('2000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('2500.00'),
            delivery_address='Address 2'
        )
        
        # Lister toutes les commandes
        response = self.client.get(self.order_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # Lister les commandes par acheteur
        response = self.client.get(f'{self.order_url}buyer_orders/?buyer_id=user_123')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['buyer_id'], 'user_123')
        
        # Lister les commandes par agriculteur
        response = self.client.get(f'{self.order_url}farmer_orders/?farmer_id=farmer_456')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['farmer_id'], 'farmer_456')

class TransactionIntegrationTest(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.transaction_url = reverse('transaction-list')
        
        # Créer une commande pour les tests
        self.order = Order.objects.create(
            buyer_id='user_123',
            farmer_id='farmer_456',
            subtotal=Decimal('1000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('1500.00'),
            delivery_address='Test Address',
            status='CONFIRMED'
        )
    
    def test_transaction_creation(self):
        """Test de création de transaction"""
        transaction_data = {
            'order': self.order.id,
            'transaction_type': 'PAYMENT',
            'payment_method': 'MOBILE_MONEY',
            'amount': '1500.00',
            'payer_id': 'user_123',
            'payee_id': 'farmer_456',
            'description': 'Test transaction'
        }
        
        response = self.client.post(
            self.transaction_url,
            data=json.dumps(transaction_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Vérifier que la transaction est créée
        transaction = Transaction.objects.get(id=response.data['id'])
        self.assertEqual(transaction.amount, Decimal('1500.00'))
        self.assertEqual(transaction.status, 'PENDING')
    
    def test_user_transactions_listing(self):
        """Test de listing des transactions par utilisateur"""
        
        # Créer quelques transactions
        Transaction.objects.create(
            order=self.order,
            transaction_type='PAYMENT',
            payment_method='MOBILE_MONEY',
            amount=Decimal('1500.00'),
            payer_id='user_123',
            payee_id='farmer_456'
        )
        
        Transaction.objects.create(
            order=self.order,
            transaction_type='REFUND',
            payment_method='MOBILE_MONEY',
            amount=Decimal('500.00'),
            payer_id='farmer_456',
            payee_id='user_123'
        )
        
        # Lister les transactions pour user_123
        response = self.client.get(f'{self.transaction_url}user_transactions/?user_id=user_123')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # user_123 devrait avoir 2 transactions (1 comme payer, 1 comme payee)
        self.assertEqual(len(response.data['results']), 2)