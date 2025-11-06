from django.core.management.commands.runserver import Command as RunserverCommand
from django.conf import settings

class Command(RunserverCommand):
    help = 'Run server on port from config service'

    def handle(self, *args, **options):
        # Forcer le port de la configuration
        config_port = getattr(settings, 'SERVICE_PORT', 8086)
        options['addrport'] = f"127.0.0.1:{config_port}"
        
        self.stdout.write(
            self.style.SUCCESS(f'🚀 Starting server on port {config_port} (from config service)')
        )
        
        super().handle(*args, **options)