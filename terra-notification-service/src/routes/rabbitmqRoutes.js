import express from 'express';
import {
  checkUserCreatedMessages,
  consumeUserCreatedMessage,
  getRabbitMQQueues
} from '../controllers/rabbitmq.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ
router.get('/rabbitmq/queues', getRabbitMQQueues);
router.post('/check/user-created', checkUserCreatedMessages);
router.post('/consume/user-created', consumeUserCreatedMessage);

export default router;