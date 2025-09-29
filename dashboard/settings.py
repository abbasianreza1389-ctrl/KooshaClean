# settings.py
INSTALLED_APPS += ["corsheaders", "rest_framework"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", *MIDDLEWARE]
CORS_ALLOWED_ORIGINS = ["http://localhost:3000","http://localhost:3100"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000","http://localhost:3100"]

REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
  "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",)
}
