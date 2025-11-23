import express from 'express';
import {
  consumeUserCreatedMessage,
} from '../controllers/user.created.controller.js';

const router = express.Router();

// Routes pour interagir avec RabbitMQ

router.post('/consume/user-created', consumeUserCreatedMessage);

export default router;