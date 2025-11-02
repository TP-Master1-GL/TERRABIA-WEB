console.log('main: script started (before imports)');

import express from 'express';
import { connectDB } from './database/index.js';
import { connectRabbitMQ } from './events/rabbitmq.js';
import { startConsumer } from './events/consumer.js';
import { port } from './config/index.js';
import Notification from './models/Notification.js';

(async () => {
  try {
    const app = express();
    app.use(express.json());

    app.get('/health', (req, res) => res.send('Notification Service running'));

    console.log('startup: connecting to DB...');
    await connectDB();
    console.log('startup: connected to DB');

    console.log('startup: syncing Notification model...');
    await Notification.sync();
    console.log('startup: Notification.sync done');

    console.log('startup: connecting to RabbitMQ...');
    await connectRabbitMQ();
    console.log('startup: connected to RabbitMQ');

    console.log('startup: starting consumer...');
    await startConsumer();
    console.log('startup: consumer started');

    app.listen(port, () => console.log(`🚀 Notification Service running on port ${port}`));
  } catch (err) {
    console.error('startup error:', err);
    process.exit(1);
  }
})();
