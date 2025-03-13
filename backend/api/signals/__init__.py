from django.apps import AppConfig
from . import payment_signals

# This ensures all signals are loaded
default_app_config = 'api.apps.ApiConfig' 