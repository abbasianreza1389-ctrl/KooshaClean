# Koosha Starter (Sprint 0 Baseline)

## راه‌اندازی سریع (لوکال)
### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py bootstrap_roles
python manage.py runserver 0.0.0.0:8000
```

### Website
```bash
cd website
cp .env.local.example .env.local
npm i
npm run dev -p 3000
```

### تست سریع JWT
- `POST /api/auth/jwt/create/` با `username/password` → دریافت `access/refresh`
- `GET /api/me/` با `Authorization: Bearer <access>`

## نکات امنیتی برای تولید
- محدودسازی CORS به دامنه‌های واقعی، فعال‌سازی HSTS/H2/HTTPS
- استفاده از S3/MinIO برای Media + لینک امضا‌شده
- مانیتورینگ (OTEL) و Synthetic برای مسیر رزرو/پرداخت
