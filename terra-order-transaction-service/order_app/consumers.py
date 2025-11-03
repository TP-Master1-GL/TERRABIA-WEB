import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Order

class OrderTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'order_{self.order_id}'

        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recevoir un message du WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Envoyer le message au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'order_update',
                'message': message
            }
        )

    # Recevoir un message du groupe
    async def order_update(self, event):
        message = event['message']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def get_order_status(self, order_id):
        try:
            order = Order.objects.get(id=order_id)
            return order.status
        except Order.DoesNotExist:
            return None