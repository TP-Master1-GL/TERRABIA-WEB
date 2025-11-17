# users/rabbitmq_consumer.py
import logging
logger = logging.getLogger(__name__)

def start_consumer():
    """
    Consommateur RabbitMQ pour terra-users-service.
    Pour l'instant, ce service ne consomme aucun événement,
    mais le thread est prêt pour le futur (ex: écouter profile_updated depuis un autre service).
    """
    logger.info("[RabbitMQ Consumer] terra-users-service en écoute (mode silencieux)")
    # On garde juste le thread vivant
    import time
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        logger.info("[RabbitMQ Consumer] Arrêt du consommateur")