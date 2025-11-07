import pytest
from django.test import TestCase
from unittest.mock import Mock, patch
from decimal import Decimal
from order_app.services import OrderService, CatalogService, UserService
from order_app.models import Order, OrderItem
import requests

class OrderServiceTest(TestCase):
    
    def setUp(self):
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
                }
            ],
            'delivery_address': '123 Test Street'
        }
    
    @patch('order_app.services.UserService.validate_user')
    @patch('order_app.services.CatalogService.get_product_details')
    @patch('order_app.services.CatalogService.reserve_stock')
    def test_create_order_success(self, mock_reserve_stock, mock_get_product, mock_validate_user):
        """Test de création de commande réussie"""
        # Mock des services externes
        mock_validate_user.return_value = True
        mock_get_product.return_value = {'name': 'Tomates', 'price': '400.00'}
        mock_reserve_stock.return_value = True
        
        order = OrderService.create_order(self.order_data)
        
        self.assertIsInstance(order, Order)
        self.assertEqual(order.buyer_id, 'user_123')
        self.assertEqual(order.farmer_id, 'farmer_456')
        self.assertEqual(order.items.count(), 1)
        
        # Vérifier que les mocks ont été appelés
        mock_validate_user.assert_called()
        mock_get_product.assert_called()
        mock_reserve_stock.assert_called()
    
    @patch('order_app.services.UserService.validate_user')
    def test_create_order_user_validation_failed(self, mock_validate_user):
        """Test d'échec de validation utilisateur"""
        mock_validate_user.return_value = False
        
        with self.assertRaises(ValueError) as context:
            OrderService.create_order(self.order_data)
        
        self.assertIn('not found', str(context.exception).lower())
    
    @patch('order_app.services.UserService.validate_user')
    @patch('order_app.services.CatalogService.get_product_details')
    def test_create_order_product_not_found(self, mock_get_product, mock_validate_user):
        """Test d'échec produit non trouvé"""
        mock_validate_user.return_value = True
        mock_get_product.return_value = None
        
        with self.assertRaises(ValueError) as context:
            OrderService.create_order(self.order_data)
        
        self.assertIn('product', str(context.exception).lower())

class CatalogServiceTest(TestCase):
    
    @patch('order_app.services.requests.get')
    def test_get_product_details_success(self, mock_get):
        """Test de récupération des détails produit réussie"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'id': 'prod_001',
            'name': 'Tomates fraîches',
            'price': '400.00',
            'stock': 100
        }
        mock_get.return_value = mock_response
        
        result = CatalogService.get_product_details('prod_001')
        
        self.assertIsNotNone(result)
        self.assertEqual(result['name'], 'Tomates fraîches')
        mock_get.assert_called_once()
    
    @patch('order_app.services.requests.get')
    def test_get_product_details_failure(self, mock_get):
        """Test d'échec de récupération des détails produit"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        result = CatalogService.get_product_details('prod_999')
        
        self.assertIsNone(result)
    
    @patch('order_app.services.requests.post')
    def test_reserve_stock_success(self, mock_post):
        """Test de réservation de stock réussie"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        result = CatalogService.reserve_stock('prod_001', Decimal('2.5'))
        
        self.assertTrue(result)
        mock_post.assert_called_once()