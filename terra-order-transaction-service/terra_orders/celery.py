import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terra_orders.settings')

app = Celery('terra_orders')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

# Configuration pour les tâches périodiques
app.conf.beat_schedule = {
    'send-eureka-heartbeat': {
        'task': 'order_app.tasks.send_eureka_heartbeat',
        'schedule': 30.0,  # Toutes les 30 secondes
    },
    'cleanup-expired-orders': {
        'task': 'order_app.tasks.cleanup_expired_orders',
        'schedule': 3600.0,  # Toutes les heures
    },
    'refresh-configuration': {
        'task': 'order_app.tasks.refresh_configuration_task',
        'schedule': 300.0,  # Toutes les 5 minutes
    },
}