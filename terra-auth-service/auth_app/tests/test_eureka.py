from unittest.mock import patch, MagicMock
from auth_app.apps import AuthAppConfig
import auth_app
import pytest

@pytest.fixture
def mock_config():
    return {
        "eureka.client.serviceUrl.defaultZone": "http://eureka:8761/eureka/",
        "server.port": "8000"
    }

def test_eureka_registration_success(mock_config):
    app_config = AuthAppConfig('auth_app', auth_app)

    with patch('auth_app.apps.get_config', return_value=mock_config), \
         patch('auth_app.apps.get_local_ip', return_value="192.168.90.76"), \
         patch('requests.post') as mock_post:

        mock_resp = MagicMock()
        mock_resp.status_code = 204
        mock_post.return_value = mock_resp

        app_config._register_eureka()

        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "http://eureka:8761/eureka/apps/TERRA-AUTH-SERVICE"
        payload = kwargs['json']['instance']

        assert payload['instanceId'] == "192.168.90.76:8000"
        assert payload['app'] == "TERRA-AUTH-SERVICE"
        assert payload['ipAddr'] == "192.168.90.76"
        assert payload['port']['$'] == 8000


def test_eureka_registration_failure(mock_config):
    app_config = AuthAppConfig('auth_app', auth_app)

    with patch('auth_app.apps.get_config', return_value=mock_config), \
         patch('requests.post', side_effect=Exception("Network error")):

        # Ne doit pas planter
        app_config._register_eureka()
