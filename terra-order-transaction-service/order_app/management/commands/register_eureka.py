from django.core.management.base import BaseCommand
from config.configuration_client import EurekaClient

class Command(BaseCommand):
    help = 'Register service with Eureka'

    def handle(self, *args, **options):
        self.stdout.write('Registering with Eureka...')
        success = EurekaClient.register_with_eureka()
        if success:
            self.stdout.write(
                self.style.SUCCESS('Successfully registered with Eureka')
            )
        else:
            self.stdout.write(
                self.style.ERROR('Failed to register with Eureka')
            )