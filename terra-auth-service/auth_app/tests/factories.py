# auth_app/tests/factories.py
import factory
from django.contrib.auth.hashers import make_password
from ..models import User, RefreshToken, BlacklistToken
import uuid
from datetime import datetime, timedelta


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    id = factory.LazyFunction(lambda: uuid.uuid4())
    email = factory.Faker('email')
    password = factory.LazyFunction(lambda: make_password('password123'))
    role = factory.Faker('random_element', elements=['acheteur', 'vendeur', 'admin'])


class RefreshTokenFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RefreshToken

    token = factory.Faker('uuid4')
    user = factory.SubFactory(UserFactory)
    expiration = factory.LazyFunction(lambda: datetime.utcnow() + timedelta(days=7))


class BlacklistTokenFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BlacklistToken

    token = factory.Faker('uuid4')
    expiration = factory.LazyFunction(lambda: datetime.utcnow() + timedelta(minutes=15))