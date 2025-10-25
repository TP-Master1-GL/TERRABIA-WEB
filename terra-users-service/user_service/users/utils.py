
import pika
import json
import os

def publish_event(event_type, data):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        channel.queue_declare(queue='user_events')
        message = json.dumps({'event_type': event_type, 'data': data})
        channel.basic_publish(exchange='', routing_key='user_events', body=message)
        connection.close()
    except Exception as e:
        print(f"Erreur lors de la publication de l'événement : {e}")