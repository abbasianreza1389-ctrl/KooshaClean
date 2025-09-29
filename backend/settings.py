import os, json
from datetime import timedelta

DEBUG = os.getenv("DJANGO_DEBUG","False").lower()=="true"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
ALLOWED_HOSTS = [h.strip() for h in os.getenv("DJANGO_ALLOWED_HOSTS","localhost").split(",")]

CSRF_TRUSTED_ORIGINS = [u.strip() for u in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS","").split(",") if u.strip()]
CORS_ALLOWED_ORIGINS = [u.strip() for u in os.getenv("CORS_ALLOWED_ORIGINS","").split(",") if u.strip()]

SECURE_SSL_REDIRECT = os.getenv("DJANGO_SECURE_SSL_REDIRECT","True")=="True"
SESSION_COOKIE_SECURE = os.getenv("DJANGO_SESSION_COOKIE_SECURE","True")=="True"
CSRF_COOKIE_SECURE = os.getenv("DJANGO_CSRF_COOKIE_SECURE","True")=="True"
SECURE_HSTS_SECONDS = int(os.getenv("DJANGO_HSTS_SECONDS","31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv("DJANGO_HSTS_INCLUDE_SUBDOMAINS","True")=="True"
SECURE_HSTS_PRELOAD = os.getenv("DJANGO_HSTS_PRELOAD","True")=="True"
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
REFERRER_POLICY = "strict-origin-when-cross-origin"

INSTALLED_APPS += ["corsheaders","rest_framework","rest_framework_simplejwt","django_cleanup.apps.CleanupConfig"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", *MIDDLEWARE]

REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
  "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
  "DEFAULT_THROTTLE_CLASSES": [
    "rest_framework.throttling.AnonRateThrottle",
    "rest_framework.throttling.UserRateThrottle",
    "rest_framework.throttling.ScopedRateThrottle",
  ],
  "DEFAULT_THROTTLE_RATES": {
    "anon": "60/min",
    "user": "600/min",
    "login": "10/min",
    "upload": "30/min",
  }
}

SIMPLE_JWT = {
  "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MIN","60"))),
  "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS","7"))),
  "ROTATE_REFRESH_TOKENS": os.getenv("JWT_ROTATE","True")=="True",
  "BLACKLIST_AFTER_ROTATION": os.getenv("JWT_BLACKLIST","True")=="True",
  "AUTH_HEADER_TYPES": ("Bearer",),
}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher","django.contrib.auth.hashers.PBKDF2PasswordHasher"]
AUTH_PASSWORD_VALIDATORS = [
  {"NAME":"django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
  {"NAME":"django.contrib.auth.password_validation.MinimumLengthValidator","OPTIONS":{"min_length":12}},
  {"NAME":"django.contrib.auth.password_validation.CommonPasswordValidator"},
  {"NAME":"django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# پایگاه‌داده
if os.getenv("DB_ENGINE","sqlite")=="postgresql":
    DATABASES["default"] = {
      "ENGINE":"django.db.backends.postgresql",
      "NAME": os.getenv("DB_NAME"),
      "USER": os.getenv("DB_USER"),
      "PASSWORD": os.getenv("DB_PASSWORD"),
      "HOST": os.getenv("DB_HOST","127.0.0.1"),
      "PORT": os.getenv("DB_PORT","5432"),
      "CONN_MAX_AGE": 60
    }

# رسانه‌ها
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("MEDIA_MAX_MB","25")) * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = FILE_UPLOAD_MAX_MEMORY_SIZE

# لاگینگ ساختارمند + چرخش فایل
LOG_DIR = BASE_DIR / "logs"; LOG_DIR.mkdir(exist_ok=True)
LOGGING = {
  "version": 1,
  "disable_existing_loggers": False,
  "formatters": {
    "json": {"()":"pythonjsonlogger.jsonlogger.JsonFormatter","fmt":"%(asctime)s %(levelname)s %(name)s %(message)s"},
    "simple": {"format":"[%(asctime)s] %(levelname)s %(name)s: %(message)s"}
  },
  "handlers": {
    "console":{"class":"logging.StreamHandler","formatter":"simple"},
    "file":{"class":"logging.handlers.RotatingFileHandler","filename":str(LOG_DIR/"app.log"),"maxBytes":5*1024*1024,"backupCount":5,"formatter":"json"},
  },
  "root":{"handlers":["console","file"],"level":"INFO"},
  "django.request":{"handlers":["console","file"],"level":"WARNING","propagate":False}
}
