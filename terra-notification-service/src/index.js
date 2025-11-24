console.log('main: script started (before imports)');

import express from 'express';
import { connectDB } from './database/index.js';
import { connectRabbitMQ } from './events/rabbitmq.js';
import { startConsumer } from './events/consumer.js';
import {startodercreationconsumer} from './events/consumeordercreation.js';
import { initializeConfig } from './config/index.js';
import Notification from './models/Notification.js';

import UserCreated from './routes/usercreated.Routes.js';
import ordercreated from './routes/ordercreated.Routes.js';
import ordercompleted from './routes/ordercompleted.routes.js';
import orderpaid from './routes/orderpaid.routes.js';
import ordercancelled from './routes/order.cancelled.routes.js';

import { startodercancelledconsumer } from './events/consumeordercamcelled.js';
import { startoderpaidconsumer } from './events/consumeorderpaid.js';
import {startodercompletionconsumer} from './events/consumordercompletion.js';
import eurekaClient from './services/eurekaClient.js';

(async () => {
  try {
    console.log('startup: fetching configuration from Config Service...');
    const config = await initializeConfig();
    console.log('startup: configuration loaded successfully');

    const app = express();
    app.use(express.json());

    // route pour tester que le service est en marche
    app.get('/', (req, res) => {
      res.json({
        service: 'Notification Service',
        status: 'RUNNING',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          consume: '/api/consume/user-created',
          manualTrigger: '/api/events/user-created'
        },
        eurekaRegistered: eurekaClient.isConnected(),
        timestamp: new Date().toISOString()
      });
    });

    // Routes RabbitMQ
    app.use('/api', UserCreated);
    app.use('/api',ordercreated );
    app.use('/api', ordercompleted);
    app.use('/api',orderpaid);
    app.use('/api', ordercancelled);
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'UP',
        service: 'Notification Service',
        timestamp: new Date().toISOString(),
        eurekaRegistered: eurekaClient.isConnected()
      });
    });

    console.log('startup: connecting to DB...');
    await connectDB();
    console.log('startup: connected to DB');

    console.log('startup: syncing Notification model...');
    await Notification.sync();
    console.log('startup: Notification.sync done');

    console.log('startup: connecting to RabbitMQ...');
    await connectRabbitMQ();
    console.log('startup: connected to RabbitMQ');

    console.log('startup: starting userconsumer...');
    await startConsumer();

    console.log('startup: starting ordercompletion consumer ...');
    await startodercompletionconsumer();

 console.log('startup: starting order cancelled consumer ...');
    await startodercancelledconsumer();

    console.log('startup: starting orderconsumer...');
    await startodercreationconsumer();

     console.log('startup: starting orderconsumer...');
    await startoderpaidconsumer();

    console.log('startup: consumer started');

    app.listen(config.port, () => {
      console.log(`🚀 Notification Service running on port ${config.port}`);
    console.log('startup: registering with Eureka...');
    eurekaClient.start();
      
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  / - Service info`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/consume/user-created -`);
      console.log('POST /api/consume/order-created - ');
      console.log('POST /api/consume/order-completed -');
      console.log('POST /api/consume/order-paid - ');
      console.log('POST /api/consume/order-cancelled - ');

    });

    // Gestion propre de l'arrêt
      process.on('SIGTERM', () => {
      console.log('Shutting down gracefully...');
      eurekaClient.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...');
      eurekaClient.stop();
      process.exit(0);
    });

  } catch (err) {
    console.error('startup error:', err);
    process.exit(1);
  }
})();