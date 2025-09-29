import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"), integrations=[DjangoIntegration()], traces_sample_rate=0.1)
