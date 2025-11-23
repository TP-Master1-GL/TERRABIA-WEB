import { getChannel } from './rabbitmq.js';
import { handleOrderCreated } from './handlers/orderCreated.js';
import { handleOrderPaid } from './handlers/orderPaid.js';
import { handleOrderCancelled } from './handlers/orderCancelled.js';
import { handleOrderCompleted } from './handlers/orderCompleted.js';

// Configuration RabbitMQ pour les événements d'ordre
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'terra_events';
const EXCHANGE_TYPE = 'topic';
const QUEUE_PREFIX = process.env.RABBITMQ_QUEUE_PREFIX || 'terra_order_service';

// Routes pour les différents événements
const EVENT_ROUTES = [
  { routingKey: 'order.created', handler: handleOrderCreated },
  { routingKey: 'order.paid', handler: handleOrderPaid },
  { routingKey: 'order.cancelled', handler: handleOrderCancelled },
  { routingKey: 'order.completed', handler: handleOrderCompleted },
];

export async function startOrderConsumer() {
  const channel = getChannel();

  // Déclarer l'exchange
  await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
  console.log(`✅ Order consumer: connected to exchange "${EXCHANGE}"`);

  // Créer et binder les queues pour chaque événement
  for (const { routingKey, handler } of EVENT_ROUTES) {
    const queueName = `${QUEUE_PREFIX}.${routingKey.replace('.', '_')}`;
    
    await channel.assertQueue(queueName, { 
      durable: true,
      arguments: {
        'x-dead-letter-exchange': `${EXCHANGE}.dlx`,
        'x-dead-letter-routing-key': `${routingKey}.dlq`
      }
    });
    
    await channel.bindQueue(queueName, EXCHANGE, routingKey);
    console.log(`✅ Bound queue "${queueName}" to routing key "${routingKey}"`);

    // Démarrer le consumer pour cette queue
    await consumeMessages(channel, queueName, routingKey, handler);
  }
}

async function consumeMessages(channel, queueName, routingKey, handler) {
  channel.consume(queueName, async (msg) => {
    if (!msg || !msg.content) {
      channel.nack(msg, false, false);
      return;
    }

    try {
      const body = msg.content.toString();
      const envelope = JSON.parse(body);
      
      console.log(`📦 Received ${routingKey} event`, {
        eventType: envelope.event_type,
        orderId: envelope.data?.order_id,
        timestamp: envelope.timestamp
      });

      // Valider la structure du message
      if (!envelope.event_type || !envelope.data) {
        throw new Error('Invalid message structure');
      }

      // Appeler le handler spécifique
      await handleOrderCreated(orderData, envelope);

      // Ack si tout est bon
      channel.ack(msg);
      console.log(`✅ Successfully processed ${routingKey} for order ${envelope.data?.order_id}`);

    } catch (err) {
      console.error(`❌ Error processing ${routingKey}:`, err);
      
      // Nack sans requeue - le message va dans la DLQ
      channel.nack(msg, false, false);
      
      // Log supplémentaire pour le debugging
      console.error('Failed message:', msg.content.toString());
    }
  }, { noAck: false });
}