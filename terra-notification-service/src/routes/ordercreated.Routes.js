import express from 'express';
import {
  consumeOrderCreatedMessage,
} from '../controllers/order.created.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ

router.post('/consume/order-created', consumeOrderCreatedMessage);

export default router;