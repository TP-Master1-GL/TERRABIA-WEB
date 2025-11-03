import pytest
from django.test import TestCase
from unittest.mock import Mock, patch
from order_app.tasks import (
    publish_order_created, publish_order_paid, 
    publish_order_cancelled, RabbitMQPublisher
)
from order_app.models import Order
from decimal import Decimal

class RabbitMQPublisherTest(TestCase):
    
    @patch('order_app.tasks.pika.BlockingConnection')
    def test_publish_event_success(self, mock_connection):
        """Test de publication d'événement réussie"""
        mock_channel = Mock()
        mock_conn = Mock()
        mock_conn.channel.return_value = mock_channel
        mock_connection.return_value = mock_conn
        
        success = RabbitMQPublisher.publish_event('test.event', {'test': 'data'})
        
        self.assertTrue(success)
        mock_channel.exchange_declare.assert_called_once()
        mock_channel.basic_publish.assert_called_once()
    
    @patch('order_app.tasks.pika.BlockingConnection')
    def test_publish_event_failure(self, mock_connection):
        """Test d'échec de publication d'événement"""
        mock_connection.side_effect = Exception("Connection failed")
        
        success = RabbitMQPublisher.publish_event('test.event', {'test': 'data'})
        
        self.assertFalse(success)

class CeleryTasksTest(TestCase):
    
    def setUp(self):
        self.order = Order.objects.create(
            buyer_id='user_123',
            farmer_id='farmer_456',
            subtotal=Decimal('1000.00'),
            delivery_fee=Decimal('500.00'),
            total_amount=Decimal('1500.00'),
            delivery_address='Test Address'
        )
    
    @patch('order_app.tasks.RabbitMQPublisher.publish_event')
    def test_publish_order_created(self, mock_publish):
        """Test de tâche de publication de création de commande"""
        mock_publish.return_value = True
        
        publish_order_created(str(self.order.id))
        
        mock_publish.assert_called_once()
        self.assertEqual(mock_publish.call_args[0][0], 'order.created')
    
    @patch('order_app.tasks.RabbitMQPublisher.publish_event')
    def test_publish_order_paid(self, mock_publish):
        """Test de tâche de publication de paiement de commande"""
        mock_publish.return_value = True
        
        publish_order_paid(str(self.order.id))
        
        mock_publish.assert_called_once()
        self.assertEqual(mock_publish.call_args[0][0], 'order.paid')
    
    @patch('order_app.tasks.RabbitMQPublisher.publish_event')
    def test_publish_order_cancelled(self, mock_publish):
        """Test de tâche de publication d'annulation de commande"""
        mock_publish.return_value = True
        
        publish_order_cancelled(str(self.order.id))
        
        mock_publish.assert_called_once()
        self.assertEqual(mock_publish.call_args[0][0], 'order.cancelled')
