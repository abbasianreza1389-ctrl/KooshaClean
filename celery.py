import os
from celery import Celery
os.environ.setdefault("DJANGO_SETTINGS_MODULE","config.settings")
app = Celery("koosha")
app.conf.broker_url = os.getenv("REDIS_URL","redis://127.0.0.1:6379/0")
app.autodiscover_tasks()
