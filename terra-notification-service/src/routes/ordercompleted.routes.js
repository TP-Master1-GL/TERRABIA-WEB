import express from 'express';
import {
 consumeOrderCompletedMessage,
} from '../controllers/order.completion.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ

router.post('/consume/order-completed', consumeOrderCompletedMessage);

export default router;