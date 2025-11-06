import os
from django.core.management.commands.runserver import Command as RunserverCommand
from django.conf import settings

class Command(RunserverCommand):
    help = 'Run server with dynamic port from config service'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            '--port',
            type=int,
            help='Port number (overrides config service)',
        )

    def handle(self, *args, **options):
        # Utiliser le port depuis la configuration ou l'argument
        port = options.get('port') or getattr(settings, 'SERVICE_PORT', 8000)
        
        if port:
            options['addrport'] = f"0.0.0.0:{port}"
            self.stdout.write(
                self.style.SUCCESS(
                    f'🚀 Starting development server at http://0.0.0.0:{port}/'
                )
            )
        
        super().handle(*args, **options)