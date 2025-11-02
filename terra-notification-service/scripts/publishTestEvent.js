import amqp from 'amqplib';

const RABBIT = process.env.RABBITMQ_URL || 'amqp://localhost:5673';
const exchange = 'user_events';

const [, , toEmail = 'maffo.ngaleu@gmail.com', toName = 'Test User', id = '123'] = process.argv;

(async () => {
  try {
    const conn = await amqp.connect(RABBIT);
    const ch = await conn.createChannel();
    await ch.assertExchange(exchange, 'fanout', { durable: true });

    const event = {
      type: 'USER_REGISTERED',
      data: { id: Number(id), email: toEmail, name: toName }
    };

    ch.publish(exchange, '', Buffer.from(JSON.stringify(event)));
    console.log('event published ->', event);

    await ch.close();
    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error('publish error:', err);
    process.exit(1);
  }
})();
