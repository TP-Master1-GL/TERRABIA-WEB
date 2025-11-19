console.log('main: script started (before imports)');

import express from 'express';
import { connectDB } from './database/index.js';
import { connectRabbitMQ } from './events/rabbitmq.js';
import { startConsumer } from './events/consumer.js';
import { initializeConfig } from './config/index.js';
import Notification from './models/Notification.js';
import rabbitmqRoutes from './routes/rabbitmqRoutes.js';
import eurekaClient from './services/eurekaClient.js';

(async () => {
  try {
    console.log('startup: fetching configuration from Config Service...');
    const config = await initializeConfig();
    console.log('startup: configuration loaded successfully');

    const app = express();
    app.use(express.json());

    // ⭐ AJOUTEZ CETTE ROUTE RACINE ⭐
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
    app.use('/api', rabbitmqRoutes);
    
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

    console.log('startup: starting consumer...');
    await startConsumer();
    console.log('startup: consumer started');

    app.listen(config.port, () => {
      console.log(`🚀 Notification Service running on port ${config.port}`);
      console.log('startup: registering with Eureka...');
      eurekaClient.start();
      
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  / - Service info`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/consume/user-created - Consommer un message RabbitMQ`);
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