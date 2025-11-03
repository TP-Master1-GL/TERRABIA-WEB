import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from decimal import Decimal
from order_app.models import Order, OrderItem, Transaction, PaymentAttempt
import uuid

class OrderModelTest(TestCase):
    
    def setUp(self):
        self.order_data = {
            'buyer_id': 'user_123',
            'farmer_id': 'farmer_456',
            'subtotal': Decimal('1000.00'),
            'delivery_fee': Decimal('500.00'),
            'total_amount': Decimal('1500.00'),
            'delivery_address': '123 Test Street'
        }
    
    def test_create_order(self):
        """Test de création d'une commande"""
        order = Order.objects.create(**self.order_data)
        
        self.assertIsNotNone(order.id)
        self.assertIsNotNone(order.order_number)
        self.assertTrue(order.order_number.startswith('TRB'))
        self.assertEqual(order.status, 'PENDING')
        self.assertEqual(order.buyer_id, 'user_123')
        self.assertEqual(order.total_amount, Decimal('1500.00'))
    
    def test_order_string_representation(self):
        """Test de la représentation en string d'une commande"""
        order = Order.objects.create(**self.order_data)
        expected_str = f"Order {order.order_number} - PENDING"
        self.assertEqual(str(order), expected_str)
    
    def test_order_status_choices(self):
        """Test des choix de statut de commande"""
        order = Order.objects.create(**self.order_data)
        
        # Test statut valide
        order.status = 'PAID'
        order.save()
        
        # Test statut invalide
        with self.assertRaises(ValidationError):
            order.status = 'INVALID_STATUS'
            order.full_clean()
    
    def test_order_save_generates_order_number(self):
        """Test que order_number est généré automatiquement"""
        order = Order(**self.order_data)
        self.assertIsNone(order.order_number)
        
        order.save()
        self.assertIsNotNone(order.order_number)
        self.assertTrue(len(order.order_number) > 10)

class OrderItemModelTest(TestCase):
    
    def setUp(self):
        self.order = Order.objects.create(
            buyer_id='user_123',
            farmer_id='farmer_456',
            subtotal=Decimal('1000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('1500.00'),
            delivery_address='123 Test Street'
        )
    
    def test_create_order_item(self):
        """Test de création d'un article de commande"""
        item = OrderItem.objects.create(
            order=self.order,
            product_id='prod_001',
            product_name='Tomates fraîches',
            quantity=Decimal('2.5'),
            unit='kg',
            unit_price=Decimal('400.00')
        )
        
        self.assertIsNotNone(item.id)
        self.assertEqual(item.total_price, Decimal('1000.00'))  # 2.5 * 400
        self.assertEqual(item.order, self.order)
    
    def test_order_item_total_price_calculation(self):
        """Test du calcul automatique du prix total"""
        item = OrderItem(
            order=self.order,
            product_id='prod_001',
            product_name='Tomates',
            quantity=Decimal('3.0'),
            unit_price=Decimal('500.00')
        )
        
        item.save()
        self.assertEqual(item.total_price, Decimal('1500.00'))
    
    def test_order_item_string_representation(self):
        """Test de la représentation en string d'un article"""
        item = OrderItem.objects.create(
            order=self.order,
            product_id='prod_001',
            product_name='Tomates fraîches',
            quantity=Decimal('2.5'),
            unit='kg',
            unit_price=Decimal('400.00')
        )
        
        expected_str = "Tomates fraîches x 2.5 kg"
        self.assertEqual(str(item), expected_str)

class TransactionModelTest(TestCase):
    
    def setUp(self):
        self.order = Order.objects.create(
            buyer_id='user_123',
            farmer_id='farmer_456',
            subtotal=Decimal('1000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('1500.00'),
            delivery_address='123 Test Street'
        )
    
    def test_create_transaction(self):
        """Test de création d'une transaction"""
        transaction = Transaction.objects.create(
            order=self.order,
            transaction_type='PAYMENT',
            payment_method='MOBILE_MONEY',
            amount=Decimal('1500.00'),
            payer_id='user_123',
            payee_id='farmer_456'
        )
        
        self.assertIsNotNone(transaction.id)
        self.assertIsNotNone(transaction.transaction_reference)
        self.assertTrue(transaction.transaction_reference.startswith('TXN'))
        self.assertEqual(transaction.status, 'PENDING')
    
    def test_transaction_string_representation(self):
        """Test de la représentation en string d'une transaction"""
        transaction = Transaction.objects.create(
            order=self.order,
            transaction_type='PAYMENT',
            payment_method='MOBILE_MONEY',
            amount=Decimal('1500.00'),
            payer_id='user_123',
            payee_id='farmer_456'
        )
        
        expected_str = f"Transaction {transaction.transaction_reference} - 1500.00 XAF"
        self.assertEqual(str(transaction), expected_str)