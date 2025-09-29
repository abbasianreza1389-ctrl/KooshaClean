# نقشه‌ی راه تکمیل پروژه «کوشا» تا ۱۰۰٪ طبق سند

این سند کل مسیر را به ۱۰ گام اجرایی با «DoD/تست پذیرش» تقسیم می‌کند. هر گام خروجی قابل تحویل دارد.  
برای اجرای خودکار، از اسکریپت‌های پوشه‌ی `scripts/` استفاده کنید.

## 0) Traceability (ردیابی سند ↔ فیچر)
- خروجی: `traceability/traceability.csv`
- هر ردیف: `SpecKey, Feature, API, UI, Report, Owner, Status`

## 1) Availability واقعی + جلوگیری از دوبار‌رزرو + حلقه‌ی تأیید منشی
- API: `GET /api/availability/slots/?provider=&date=`
- API: `POST /api/public/booking_requests/` → `POST /api/public/approve/{id}?action=approve|reject`
- DoD: رعایت Rule/Exception/Capacity و `max_concurrent`، لاگ ممیزی تأیید/رد

## 2) هسته مالی و قرارداد درمانگر
- مدل‌ها: `ServiceCode`, `ProviderContract(percent|fixed per service)`
- انجام نوبت ⇒ `BillingEntry` با سهم‌ها
- DoD: `POST /api/billing/close-period/` قفل دوره و ایجاد Settlement

## 3) قوانین بیمه (پایه/تکمیلی) و محاسبه سهم‌ها
- مدل: `InsuranceRule(base|supp, tariff, patient_share, caps...)`
- DoD: محاسبه سهم بیمار/بیمه/کلینیک/سرپرست/بازاریاب + تست سناریوهای لبه

## 4) صندوق‌داری و «تحویل صندوق»
- مدل‌ها: `CashSession(open/close)`, `Payment(...)`
- گزارش: `GET /api/reports/billing.csv` + `api/cash/export` (CSV/PDF)
- محدودیت بدهی/اعتبار بیمار در رزرو

## 5) داشبوردهای نقش‌محور (Next.js)
- صفحات: `/admin-dashboard`, `/reception`, `/accounting`, `/provider`
- APIهای KPI: `/api/kpi/overview`, `/capacity`, `/revenue`

## 6) پرتال بیمار (EHR-lite)
- صفحات: پروفایل، نوبت‌ها، پرداخت، نسخه/ارجاع، پیام امن

## 7) وب‌سایت محتوایی و مسیرهای دسترسی (SEO/RTL/A11y)
- CMS سبک `sitecontent`، صفحات: خانه/خدمات/وبلاگ/راهنما/FAQ/تماس
- SEO: `sitemap.xml`, `robots.txt`، meta per page، دسترس‌پذیری AA

## 8) امنیت/عملیات Production
- Nginx+HTTPS، `DEBUG=False`, ALLOWED_HOSTS، CORS/CSRF محدود
- Sentry، Backup DB، Healthcheck

## 9) کیفیت و کارایی
- تست‌های Unit/Integration برای Availability و مالی
- E2E سبک: «رزرو عمومی→تأیید→انجام→سند مالی→بستن دوره»
- ایندکس DB و کش سبک KPI

## 10) مستندات، آموزش و Go-Live
- راهنمای استقرار، SOP «تحویل صندوق»، آموزش نقش‌ها
- Dry-run + پنجره Go-Live + مانیتور ۴۸ساعت

---

### بسته‌های همراه
- `backend_skeleton/` اسکلت اپ‌ها
- `frontend_template/` الگوی Next+Tailwind
- `scripts/` اسکریپت‌های پاورشل (one-click)
- `postman/` کالکشن تست API
- `traceability/` قالب CSV ردیابی
