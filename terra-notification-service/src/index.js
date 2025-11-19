console.log('main: script started (before imports)');

import express from 'express';
import { connectDB } from './database/index.js';
import { connectRabbitMQ } from './events/rabbitmq.js';
import { startConsumer } from './events/consumer.js';
import { initializeConfig } from './config/index.js'; // MODIFIÉ
import Notification from './models/Notification.js';
import rabbitmqRoutes from './routes/rabbitmqRoutes.js';
import eurekaClient from './services/eurekaClient.js'; // NOUVEAU

(async () => {
  try {
    // ÉTAPE 1: Initialiser la configuration depuis le Config Service Spring Boot
    console.log('startup: fetching configuration from Config Service...');
    const config = await initializeConfig(); // MODIFIÉ
    console.log('startup: configuration loaded successfully');

    const app = express();
    app.use(express.json());

    // Routes RabbitMQ
    app.use('/api', rabbitmqRoutes);
    
    // Health check amélioré pour Eureka
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

    // ⭐⭐⭐ VOTRE APP.LISTEN EST ICI - CONSERVÉ ⭐⭐⭐
    app.listen(config.port, () => {
      console.log(`🚀 Notification Service running on port ${config.port}`);
      
      // ÉTAPE 2: S'enregistrer auprès d'Eureka APRÈS le démarrage du serveur
      console.log('startup: registering with Eureka...');
      eurekaClient.start();
      
      console.log(`📡 RabbitMQ Endpoints disponibles:`);
      console.log(`   POST /api/consume/user-created - Consommer un message`);
      console.log(`   GET  /health - Health check`);
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