INSTALLED_APPS = [
    # ...
    "rest_framework",
    "corsheaders",
    # "django_celery_beat",  # اگر زمان‌بندی لازم داری
    # اپ‌های خودت...
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # ...
]

from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# پایگاه‌داده ساده برای شروع:
if os.getenv("DB_ENGINE", "sqlite") == "sqlite":
    DATABASES = { "default": { "ENGINE": "django.db.backends.sqlite3",
                               "NAME": os.path.join(BASE_DIR, "db.sqlite3") } }
else:
    DATABASES = { "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5432"),
    } }

# Celery (Dev)
CELERY_TASK_ALWAYS_EAGER = os.getenv("CELERY_TASK_ALWAYS_EAGER", "False") == "True"
