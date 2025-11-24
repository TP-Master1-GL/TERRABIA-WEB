import express from 'express';
import {
 consumeOrderCancelledMessage,
} from '../controllers/order.cancelled.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ

router.post('/consume/order-cancelled', consumeOrderCancelledMessage);

export default router;