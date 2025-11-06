import { getChannel } from '../events/rabbitmq.js';

// @desc    Vérifier les messages user.created dans RabbitMQ
// @route   POST /api/check/user-created
// @access  Public
export const checkUserCreatedMessages = async (req, res) => {
  try {
    const channel = getChannel();
    const QUEUE = process.env.RABBITMQ_QUEUE || 'queue.user.created';
    
    console.log('Vérification des messages user.created dans RabbitMQ...');
    
    // Vérifier s'il y a des messages dans la queue
    const queueInfo = await channel.checkQueue(QUEUE);
    const messageCount = queueInfo.messageCount;
    
    if (messageCount === 0) {
      return res.json({
        success: true,
        message: 'Aucun message user.created dans la queue',
        data: {
          queue: QUEUE,
          messageCount: 0,
          messages: []
        }
      });
    }

    // Récupérer les messages sans les acknowledge (pour les laisser dans la queue)
    const messages = [];
    let message = await channel.get(QUEUE, { noAck: false });
    
    while (message) {
      try {
        const content = message.content.toString();
        const payload = JSON.parse(content);
        messages.push({
          payload: payload.payload ?? payload,
          fields: message.fields,
          properties: message.properties
        });
        
        // Remettre le message dans la queue (nack avec requeue)
        channel.nack(message, false, true);
      } catch (e) {
        console.error('Error processing message:', e);
        channel.nack(message, false, true);
      }
      
      message = await channel.get(QUEUE, { noAck: false });
    }

    res.json({
      success: true,
      message: `${messages.length} message(s) user.created trouvé(s)`,
      data: {
        queue: QUEUE,
        messageCount: messages.length,
        messages: messages
      }
    });

  } catch (error) {
    console.error('Error checking RabbitMQ messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des messages RabbitMQ',
      error: error.message
    });
  }
};

// @desc    Consommer et traiter un message user.created spécifique
// @route   POST /api/consume/user-created
// @access  Public
export const consumeUserCreatedMessage = async (req, res) => {
  try {
    const channel = getChannel();
    const QUEUE = process.env.RABBITMQ_QUEUE || 'queue.user.created';
    const { handleUserRegistration } = await import('../events/handlers/userRegistered.js');

    console.log('Tentative de consommation d\'un message user.created...');
    
    // Récupérer un message
    const message = await channel.get(QUEUE, { noAck: false });
    
    if (!message) {
      return res.json({
        success: true,
        message: 'Aucun message à consommer',
        data: {
          queue: QUEUE,
          messageConsumed: false
        }
      });
    }

    try {
      const content = message.content.toString();
      const payload = JSON.parse(content);
      const eventData = payload.payload ?? payload;

      console.log('Message consommé via API:', eventData);

      // Utiliser le même handler que le consumer
      await handleUserRegistration(eventData);

      // Ack le message pour le retirer de la queue
      channel.ack(message);

      res.json({
        success: true,
        message: 'Message user.created consommé et traité avec succès',
        data: {
          queue: QUEUE,
          messageConsumed: true,
          payload: eventData,
          actions: [
            'Email de bienvenue envoyé',
            'Notification sauvegardée',
            'Message retiré de la queue RabbitMQ'
          ]
        }
      });

    } catch (processingError) {
      // En cas d'erreur, ne pas remettre le message dans la queue
      channel.nack(message, false, false);
      throw processingError;
    }

  } catch (error) {
    console.error('Error consuming RabbitMQ message:', error);
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
    const QUEUE = process.env.RABBITMQ_QUEUE || 'queue.user.created';
    
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
    console.error('Error getting RabbitMQ queue info:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations RabbitMQ',
      error: error.message
    });
  }
};