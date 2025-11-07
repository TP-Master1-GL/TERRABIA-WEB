import { getChannel } from '../events/rabbitmq.js';
import { handleUserRegistration } from '../events/handlers/userRegistered.js';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'user.events';
const EXCHANGE_TYPE = 'topic';
const ROUTING_KEY = 'user.created';
const QUEUE = process.env.RABBITMQ_QUEUE || 'queue.user.created';

// @desc    Consommer et traiter un message user.created spécifique
// @route   POST /api/consume/user-created
// @access  Public
export const consumeUserCreatedMessage = async (req, res) => {
  try {
    const channel = getChannel();
    
    console.log(`🔍 API: Checking for messages in queue "${QUEUE}"`);

    // Vérifier d'abord l'état de la queue
    const queueInfo = await channel.checkQueue(QUEUE);
    console.log(`📊 Queue info: ${queueInfo.messageCount} messages waiting`);

    if (queueInfo.messageCount === 0) {
      return res.json({
        success: true,
        message: 'Aucun message user.created dans la queue',
        data: { 
          messageProcessed: false,
          queueStatus: 'empty'
        }
      });
    }

    // Récupérer UN SEUL message (pas channel.consume!)
    const message = await channel.get(QUEUE, { noAck: false });
    
    if (!message) {
      return res.json({
        success: true,
        message: 'Aucun message à traiter',
        data: { messageProcessed: false }
      });
    }

    try {
      const body = message.content.toString();
      const payload = JSON.parse(body);
      console.log('📨 API: Message reçu', { 
        routingKey: message.fields.routingKey, 
        payload 
      });

      const data = payload.payload ?? payload;

      // Traiter le message
      await handleUserRegistration(data);

      // Ack pour supprimer le message de la queue
      channel.ack(message);

      // RÉPONDRE au client
      res.json({
        success: true,
        message: 'Message user.created traité avec succès',
        data: {
          messageProcessed: true,
          payload: data,
          actions: [
            'Email de bienvenue envoyé',
            'Notification sauvegardée en base',
            'Message retiré de RabbitMQ'
          ]
        }
      });

    } catch (processingError) {
      console.error('❌ Erreur de traitement:', processingError);
      // En cas d'erreur, ne pas remettre le message dans la queue
      channel.nack(message, false, false);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors du traitement du message',
        error: processingError.message
      });
    }

  } catch (error) {
    console.error('❌ Error consuming RabbitMQ message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la consommation du message RabbitMQ',
      error: error.message
    });
  }
};

// @desc    Vérifier l'état des queues RabbitMQ
// @route   GET /api/rabbitmq/queues
// @access  Public
export const getRabbitMQQueues = async (req, res) => {
  try {
    const channel = getChannel();
    
    const queueInfo = await channel.checkQueue(QUEUE);
    
    res.json({
      success: true,
      data: {
        queue: QUEUE,
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
        state: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Error getting RabbitMQ queue info:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations RabbitMQ',
      error: error.message
    });
  }
};