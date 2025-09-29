# Koosha Frontend (Next.js + Tailwind)

## راه‌اندازی
1) وابستگی‌ها:
```bash
npm install
```
2) اگر API روی پورت دیگری است یا روی شبکه LAN اجرا شده، در ریشه پروژه فایل `.env.local` بسازید:
```
NEXT_PUBLIC_API=http://localhost:8000
```
3) اجرا:
```bash
npm run dev -- -p 3000
```
سپس مرورگر: `http://localhost:3000`

صفحه‌ی اصلی وضعیت اتصال به `NEXT_PUBLIC_API` را نشان می‌دهد و استایل‌ها توسط Tailwind لود می‌شوند.