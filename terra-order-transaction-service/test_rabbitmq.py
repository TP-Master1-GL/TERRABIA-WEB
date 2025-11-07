#!/usr/bin/env python
import os
import django
import pika

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terra_orders.settings')
django.setup()

from django.conf import settings

def test_rabbitmq_fixed():
    print("🔍 Test de connexion RabbitMQ avec configuration corrigée...")
    
    config = {
        'host': 'localhost',
        'port': 5672,
        'username': 'terra_user',
        'password': 'terra_password',
        'vhost': 'terra_vhost'
    }
    
    print(f"Configuration utilisée:")
    print(f"  Host: {config['host']}")
    print(f"  Port: {config['port']}")
    print(f"  Username: {config['username']}")
    print(f"  VHost: {config['vhost']}")
    
    try:
        credentials = pika.PlainCredentials(config['username'], config['password'])
        parameters = pika.ConnectionParameters(
            host=config['host'],
            port=config['port'],
            virtual_host=config['vhost'],
            credentials=credentials,
            heartbeat=600
        )
        
        connection = pika.BlockingConnection(parameters)
        print("✅ Connexion RabbitMQ réussie!")
        
        channel = connection.channel()
        print("✅ Canal créé avec succès!")
        
        # Tester la création d'échange
        channel.exchange_declare(
            exchange='terra_events',
            exchange_type='topic',
            durable=True
        )
        print("✅ Exchange 'terra_events' créé!")
        
        # Créer les queues pour les services
        queues = [
            ('notification_queue', 'order.*'),
            ('logistics_queue', 'order.paid'),
            ('catalog_queue', 'order.created'),
        ]
        
        for queue_name, routing_key in queues:
            channel.queue_declare(queue=queue_name, durable=True)
            channel.queue_bind(
                exchange='terra_events',
                queue=queue_name,
                routing_key=routing_key
            )
            print(f"✅ Queue '{queue_name}' créée et liée!")
        
        # Tester la publication
        test_message = {
            'event_type': 'test.event',
            'service': 'terra-order-service',
            'message': 'Test de connexion réussi!'
        }
        
        channel.basic_publish(
            exchange='terra_events',
            routing_key='test.event',
            body=str(test_message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # persistent
                content_type='text/plain'
            )
        )
        print("✅ Message de test publié!")
        
        connection.close()
        print("✅ Connexion fermée proprement!")
        return True
        
    except pika.exceptions.ProbableAuthenticationError as e:
        print(f"❌ Erreur d'authentification: {e}")
        print("💡 Vérifiez que les identifiants dans .env correspondent à ceux de RabbitMQ")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    if test_rabbitmq_fixed():
        print("\n🎉 RabbitMQ est correctement configuré!")
        print("📊 Interface de management: http://localhost:15672")
        print("👤 Username: terra_user")
        print("🔑 Password: terra_password")
    else:
        print("\n💥 Configuration RabbitMQ incorrecte")