// filepath: [consumer.js](http://_vscodecontentref_/2)
import { getChannel } from './rabbitmq.js';
import { handleUserRegistration} from './handlers/userRegistered.js';

 
// values provided by your classmate
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'user.events';
const EXCHANGE_TYPE = 'topic'; // use 'topic' so routing keys work (safe default)
const ROUTING_KEY = 'user.created';
const QUEUE = process.env.RABBITMQ_QUEUE || 'queue.user.created';

export async function startConsumer() {
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

      await handleUserRegistration(data);

      channel.ack(msg);
    } catch (err) {
      console.error('consumer: handler error', err);
      // decide ack/nack policy; here nack and requeue = false
      channel.nack(msg, false, false);
    }
  }, { noAck: false });
}