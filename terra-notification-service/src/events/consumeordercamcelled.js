import { getChannel } from './rabbitmq.js';
import { handleOrderCancelled } from './handlers/orderCancelled.js';

// Configuration RabbitMQ pour les événements d'ordre
const EXCHANGE = 'terra_events';
const EXCHANGE_TYPE = 'topic';
const QUEUE = 'terra_order_service';

const ROUTING_KEY = 'order.cancelled' ;

export async function startodercancelledconsumer() {

    const channel = getChannel();
    
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      await channel.assertQueue(QUEUE, { durable: true });
      await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
    
      console.log(`consumer: bound queue "${QUEUE}" to exchange "${EXCHANGE}" with routing key "${ROUTING_KEY}"`);
    
      channel.consume(QUEUE, async (msg) => {
        if (!msg || !msg.content) return;
        try {
          const body = msg.content.toString();
          const payload = JSON.parse(body);
          console.log('consumer: received message', { routingKey: msg.fields.routingKey, payload });
    
          // handle expected payload shape: payload (object) or envelope with "payload" field
          const data = payload.payload ?? payload;
    
          await handleOrderCancelled(data);
    
          channel.ack(msg);
        } catch (err) {
          console.error('consumer: handler error', err);
          // decide ack/nack policy; here nack and requeue = false
          channel.nack(msg, false, false);
        }
      }, { noAck: false });
    
}