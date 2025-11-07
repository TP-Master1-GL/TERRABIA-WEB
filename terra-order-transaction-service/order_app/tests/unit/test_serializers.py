import pytest
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from decimal import Decimal
from order_app.serializers import (
    CreateOrderSerializer, UpdateOrderStatusSerializer, 
    CreateTransactionSerializer, OrderSerializer
)
import uuid

class CreateOrderSerializerTest(TestCase):
    
    def test_valid_order_serializer(self):
        """Test d'un serializer de commande valide"""
        data = {
            'buyer_id': 'user_123',
            'farmer_id': 'farmer_456',
            'items': [
                {
                    'product_id': 'prod_001',
                    'product_name': 'Tomates fraîches',
                    'quantity': '2.5',
                    'unit': 'kg',
                    'unit_price': '400.00'
                }
            ],
            'delivery_address': '123 Test Street',
            'delivery_latitude': '3.848033',
            'delivery_longitude': '11.502075',
            'buyer_notes': 'Livraison avant 18h'
        }
        
        serializer = CreateOrderSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_order_serializer_missing_required_fields(self):
        """Test avec des champs requis manquants"""
        data = {
            'buyer_id': 'user_123',
            # farmer_id manquant
            'items': [],
            'delivery_address': '123 Test Street'
        }
        
        serializer = CreateOrderSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('farmer_id', serializer.errors)
    
    def test_invalid_order_serializer_empty_items(self):
        """Test avec une liste d'articles vide"""
        data = {
            'buyer_id': 'user_123',
            'farmer_id': 'farmer_456',
            'items': [],
            'delivery_address': '123 Test Street'
        }
        
        serializer = CreateOrderSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('items', serializer.errors)

class UpdateOrderStatusSerializerTest(TestCase):
    
    def test_valid_status_update(self):
        """Test de mise à jour de statut valide"""
        data = {
            'status': 'PAID',
            'admin_notes': 'Paiement confirmé'
        }
        
        serializer = UpdateOrderStatusSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_status_update(self):
        """Test de mise à jour de statut invalide"""
        data = {
            'status': 'INVALID_STATUS',
            'cancellation_reason': 'Test'
        }
        
        serializer = UpdateOrderStatusSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)

class CreateTransactionSerializerTest(TestCase):
    
    def test_valid_transaction_serializer(self):
        """Test d'un serializer de transaction valide"""
        order_id = uuid.uuid4()
        data = {
            'order_id': order_id,
            'transaction_type': 'PAYMENT',
            'payment_method': 'MOBILE_MONEY',
            'amount': '1500.00',
            'payer_id': 'user_123',
            'payee_id': 'farmer_456',
            'description': 'Paiement de la commande'
        }
        
        serializer = CreateTransactionSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_transaction_serializer_invalid_amount(self):
        """Test avec un montant invalide"""
        order_id = uuid.uuid4()
        data = {
            'order_id': order_id,
            'transaction_type': 'PAYMENT',
            'payment_method': 'MOBILE_MONEY',
            'amount': '0.00',  # Montant invalide
            'payer_id': 'user_123',
            'payee_id': 'farmer_456'
        }
        
        serializer = CreateTransactionSerializer(data=data)
        self.assertFalse(serializer.is_valid())