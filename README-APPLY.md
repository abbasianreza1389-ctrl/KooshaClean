### این بسته چه می‌کند؟
- i18n با `next-intl` (fa/en) + صفحات زیر `src/app/[locale]/...`
- صفحهٔ Login برای JWT + اتصال پرتال بیمار به توکن
- `/services` و `/doctors` به API وصل می‌شوند
- بک‌اند: اپ `news` با endpoint `/api/posts/` + صفحهٔ `/posts`

### اجرای سریع
1) فایل‌های این بسته را روی ریشهٔ ریپو (KooshaClean) کپی/ادغام کنید.
2) PowerShell:
```powershell
Set-Location D:\KooshaClean
git checkout -b feature/i18n-book-jwt
cd website; npm i next-intl@3; cd ..
cd backend; python manage.py makemigrations news; python manage.py migrate; cd ..
git add -A
git commit -m "feat: i18n (next-intl), services/doctors wired to API, posts API, JWT login + portal"
git push -u origin HEAD
```
