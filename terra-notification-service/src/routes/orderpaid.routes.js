import express from 'express';
import {
 consumeOrderPaidMessage,
} from '../controllers/order.paid.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ

router.post('/consume/order-completed', consumeOrderPaidMessage);

export default router;