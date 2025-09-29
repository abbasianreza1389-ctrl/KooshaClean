
# Koosha — خروجی جمع‌بندی و تحویل برای چت جدید

این فایل خلاصه‌ی وضعیت فعلی پروژه و دستورهای لازم برای بالا آوردن **بک‌اند (Django)** و **فرانت‌اند (Next.js + Tailwind)** را می‌دهد تا بتوانید در یک چت تازه، کار را ادامه دهید.

---

## 1) وضعیت فعلی (مختصر)
- **Frontend**: اسکلت Next.js + Tailwind آماده است (App Router). یک صفحه‌ی ساده‌ی تست و استایل‌ها موجود است.  
  زیپ آماده دانلود: **koosha_frontend.zip**  
- **Backend**: نیاز به یک اسکلت تمیز Django دارد یا همانی که دارید باید این پکیج‌ها را داشته باشد:
  `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `django-filter`
- ایرادهای قبلی Frontend (عدم تشخیص `fs` و خطای CSS) با:
  - اصلاح ترتیب `@tailwind` در `globals.css`
  - به‌روزرسانی `tailwind.config.js` و `postcss.config.js`
  **رفع شده است**.

---

## 2) راه‌اندازی سریع از صفر — Backend (Windows / PowerShell)

> مسیر پیشنهادی: `D:\koosha\backend`

```powershell
# 1) محیط
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip setuptools wheel

# 2) نصب پکیج‌های لازم
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter

# 3) ساخت پروژه و اپ‌ها (اگر ندارید)
django-admin startproject koosha_api backend
cd backend
python manage.py startapp billing
python manage.py startapp sitecontent

# 4) ویرایش settings.py  (افزودن/اصلاح موارد زیر)
# INSTALLED_APPS:
#   'corsheaders', 'rest_framework', 'rest_framework_simplejwt', 'django_filters', 'billing', 'sitecontent'
# MIDDLEWARE:
#   'corsheaders.middleware.CorsMiddleware', ... (قبل از Common/CSRFMiddleware)
# REST_FRAMEWORK:
#   DEFAULT_AUTHENTICATION_CLASSES = ('rest_framework_simplejwt.authentication.JWTAuthentication',)
#   DEFAULT_FILTER_BACKENDS = ('django_filters.rest_framework.DjangoFilterBackend',)
# CORS/CSRF/ALLOWED_HOSTS را برای localhost:3000 باز بگذارید.

# 5) urls.py  (افزودن مسیرهای JWT و API ساده)
#   admin/ , api/ping , api/me , api/token , api/token/refresh

# 6) مهاجرت دیتابیس و ساخت ادمین
python manage.py makemigrations
python manage.py migrate

# ساخت ادمین خودکار
$py = @'
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE","koosha_api.settings")
django.setup()
from django.contrib.auth import get_user_model
U=get_user_model()
u,created=U.objects.get_or_create(username="admin",defaults={"is_staff":True,"is_superuser":True,"email":"you@example.com"})
u.set_password("adminpass"); u.save()
print("admin created" if created else "admin exists")
'@
$temp = Join-Path $env:TEMP "create_admin.py"
Set-Content -Encoding UTF8 $temp $py
python $temp
Remove-Item $temp

# 7) اجرا
python manage.py runserver 0.0.0.0:8000
```

### نمونه‌ی حداقلی فایل‌ها برای Backend
**`backend/koosha_api/urls.py`**
```py
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from sitecontent.views import ping, me

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/ping/", ping),
    path("api/me/", me),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
```

**`backend/sitecontent/views.py`**
```py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([AllowAny])
def ping(request):
    return Response({"ok": True})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({"id": user.id, "username": user.username, "email": user.email})
```

---

## 3) راه‌اندازی سریع — Frontend (Next.js + Tailwind)

> پوشه پیشنهادی: `D:\koosha\website`

1) **دانلود زیپ آماده:** `koosha_frontend.zip`  
2) از حالت فشرده خارج کنید و سپس:
```powershell
cd website
npm install
# اگر API شما جای دیگریست:
Set-Content -Encoding UTF8 .env.local "NEXT_PUBLIC_API=http://localhost:8000"
npm run dev -- -p 3000
```
مرورگر: `http://localhost:3000`

---

## 4) تست سریع توکن
```powershell
curl -Method POST -Uri http://localhost:8000/api/token/ -ContentType "application/json" -Body (@{username="admin";password="adminpass"} | ConvertTo-Json)
```

---

## 5) چک‌لیست عیب‌یابی
- **fs module در مرورگر**: نشتی از اسکن دایرکتوری یا پکیج‌های Node سمت مرورگر. در الگوی فعلی دیگر رخ نمی‌دهد.
- **CSS parsing failed**: ترتیب `@tailwind base; @tailwind components; @tailwind utilities;` باید اولین خطوط `globals.css` باشد.
- **ModuleNotFoundError: django_filters**: پکیج `django-filter` را نصب کنید و در `INSTALLED_APPS` اضافه کنید.
- **آی‌پی LAN**: اگر Next را روی دستگاه دیگری در شبکه می‌بینید، `NEXT_PUBLIC_API` باید به آی‌پی سرور بک‌اند اشاره کند.

---

## 6) دسترسی‌ها
- **Admin (Django)**: http://localhost:8000/admin — `admin / adminpass`
- **API پایه**: http://localhost:8000/api/ping
- **Front**: http://localhost:3000

---

## 7) فایل زیپ فرانت‌اند
- koosha_frontend.zip (داخل همین چت پیوست شده است)

موفق باشید! اگر لازم شد، همین فایل را در چت جدید بفرستید تا بدون جست‌وجوی تاریخچه، سریع ادامه دهیم.
