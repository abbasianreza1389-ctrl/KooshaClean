<#  Koosha – one-click setup (Windows PowerShell 7+)
    انجام خودکار:
    - Next.js i18n (next-intl) + صفحات نمونه + تعویض زبان
    - ساخت فایل‌های messages (fa/en/ar) و middleware
    - اتصال فرانت به API (NEXT_PUBLIC_API_BASE)
    - پیکربندی Django از طریق settings_local.py (CORS/REST/Jazzmin)
    - نصب وابستگی‌ها، مهاجرت‌ها و اجرای سرویس‌ها
    - ساخت اسکریپت بکاپ دیتابیس/مدیا و (درصورت ادمین) زمان‌بندی
#>

$ErrorActionPreference = "Stop"

# ==== 0) Paths & options ====
$root     = "D:\KooshaClean"         # ریشه پروژه
$web      = Join-Path $root "website"
$backend  = Join-Path $root "backend"
$apiURL   = "http://localhost:8000"  # آدرس API
$webPort  = 3000                     # پورت Next dev
$usePostgres = $false                # اگر Postgres داری $true کن
$pgBin    = "C:\Program Files\PostgreSQL\16\bin"  # مسیر ابزارهای PG (pg_dump.exe)

# ==== helpers ====
function Ensure-Dir([string]$p){
  if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null }
}
rmdir /s /q node_modules
del package-lock.json

npm i -E next@14.2.5 react@18.2.0 react-dom@18.2.0
npm i framer-motion@^10 fuse.js@^7 leaflet@^1.9 react-leaflet@^4.2.1
npm i -D typescript@^5.5 tailwindcss@^3 postcss@^8 autoprefixer@^10 @types/leaflet@^1.9

npm run dev

# ==== 1) Website (Next.js + next-intl) ====
if(-not (Test-Path $web)){ throw "Website folder not found: $web" }
Push-Location $web
try {
  Write-Host "`n[Website] installing next-intl & i18n basics..." -ForegroundColor Cyan
  # نصب کتابخانه‌ها (idempotent)
npm i next@14.2.5 react@18.3.1 react-dom@18.3.1 `
  next-intl@3 framer-motion@11 fuse.js `
  react-leaflet@4 leaflet@1.9.4 `
  @tailwindcss/forms @tailwindcss/typography

  # env برای آدرس API
  Write-Text (Join-Path $web ".env.local") @"
NEXT_PUBLIC_API_BASE=$apiURL
"@

  # tsconfig با alias '@/'
  Write-Text (Join-Path $web "tsconfig.json") @'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020","DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": { "@/*": ["*"] }
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'@

  # next.config (بدون i18n داخلی؛ next-intl middleware استفاده می‌کنیم)
  Write-Text (Join-Path $web "next.config.mjs") @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true }
};
export default nextConfig;
'@

  # Tailwind/PostCSS
  Write-Text (Join-Path $web "tailwind.config.js") @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { container: { center: true, padding: "1rem" } } },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};
'@
  Write-Text (Join-Path $web "postcss.config.js") @'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
'@
  Write-Text (Join-Path $web "src/app/globals.css") @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html[dir="rtl"] { direction: rtl; }
body { @apply bg-slate-50 text-slate-800 antialiased; }
.container { @apply max-w-6xl mx-auto px-4; }
'@

  # lib/api
  Ensure-Dir (Join-Path $web "src/lib")
  Write-Text (Join-Path $web "src/lib/api.ts") @'
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
export async function getSummary() {
  const r = await fetch(`${API_BASE}/api/me/`, { cache: "no-store" });
  if (!r.ok) throw new Error("API failed");
  return r.json();
}
'@

  # Messages
  $msgDir = Join-Path $web "src/messages"
  Ensure-Dir $msgDir
  Write-Text (Join-Path $msgDir "fa.json") @'
{
  "nav.home": "خانه",
  "nav.services": "خدمات",
  "nav.doctors": "پزشکان",
  "nav.news": "اخبار",
  "nav.appointment": "نوبت‌دهی",
  "nav.contact": "تماس",
  "hero.title": "به کوشا خوش آمدید",
  "hero.subtitle": "کلینیک هوشمند و تخصصی",
  "cta.book": "رزرو نوبت"
}
'@
  Write-Text (Join-Path $msgDir "en.json") @'
{
  "nav.home": "Home",
  "nav.services": "Services",
  "nav.doctors": "Doctors",
  "nav.news": "News",
  "nav.appointment": "Appointment",
  "nav.contact": "Contact",
  "hero.title": "Welcome to Koosha",
  "hero.subtitle": "Smart & Specialized Clinic",
  "cta.book": "Book Now"
}
'@
  Write-Text (Join-Path $msgDir "ar.json") @'
{
  "nav.home": "الرئيسية",
  "nav.services": "الخدمات",
  "nav.doctors": "الأطباء",
  "nav.news": "الأخبار",
  "nav.appointment": "حجز موعد",
  "nav.contact": "اتصال",
  "hero.title": "مرحباً بكم في كوشا",
  "hero.subtitle": "عيادة ذكية ومتخصصة",
  "cta.book": "احجز الآن"
}
'@

  # middleware (روت یا src هر دو پشتیبانی می‌شود)
  Write-Text (Join-Path $web "src/middleware.ts") @'
import createMiddleware from "next-intl/middleware";
export default createMiddleware({
  locales: ["fa","en","ar"],
  defaultLocale: "fa"
});
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
'@

  # LanguageSwitcher
  Ensure-Dir (Join-Path $web "src/components")
  Write-Text (Join-Path $web "src/components/LanguageSwitcher.tsx") @'
"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

const langs = [
  {code:"fa", label:"فا"},
  {code:"en", label:"EN"},
  {code:"ar", label:"ع"}
];

export default function LanguageSwitcher({locale}:{locale:string}){
  const path = usePathname() || "/";
  // حذف prefix فعلی زبان و جایگزینی با جدید
  const strip = path.replace(/^\/(fa|en|ar)(?=\/|$)/,"");
  return (
    <div className="flex gap-2">
      {langs.map(l => (
        <Link key={l.code}
          className={`px-2 py-1 rounded ${l.code===locale?"bg-slate-900 text-white":"bg-slate-200"}`}
          href={`/${l.code}${strip||"/"}`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
'@

  # [locale] layout
  $locDir = Join-Path $web "src/app/[locale]"
  Ensure-Dir $locDir
  Write-Text (Join-Path $locDir "layout.tsx") @'
import "../globals.css";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export async function generateStaticParams(){
  return [{locale:"fa"},{locale:"en"},{locale:"ar"}];
}

export const metadata = {
  title: "کلینیک کوشا",
  description: "پرتال رسمی کلینیک کوشا"
};

export default async function LocaleLayout({
  children, params:{locale}
}:{ children: React.ReactNode, params: {locale: "fa"|"en"|"ar"} }){
  const messages = await getMessages();
  const rtl = locale === "fa" || locale === "ar";
  return (
    <html lang={locale} dir={rtl?"rtl":"ltr"}>
      <body>
        <header className="border-b bg-white/60 backdrop-blur">
          <div className="container flex items-center justify-between py-3">
            <a href={`/${locale}`} className="font-bold">Koosha Clinic</a>
            <nav className="flex gap-4 text-sm">
              <a href={`/${locale}`}              >خانه</a>
              <a href={`/${locale}/services`}     >خدمات</a>
              <a href={`/${locale}/doctors`}      >پزشکان</a>
              <a href={`/${locale}/news`}         >اخبار</a>
              <a href={`/${locale}/appointment`}  >نوبت‌دهی</a>
              <a href={`/${locale}/contact`}      >تماس</a>
            </nav>
            <LanguageSwitcher locale={locale}/>
          </div>
        </header>
        <NextIntlClientProvider messages={messages}>
          <main className="container py-8">{children}</main>
        </NextIntlClientProvider>
        <footer className="border-t py-6 mt-10 text-sm text-slate-500">
          <div className="container">© {new Date().getFullYear()} Koosha</div>
        </footer>
      </body>
    </html>
  );
}
'@

  # [locale]/page.tsx (خانه)
  Write-Text (Join-Path $locDir "page.tsx") @'
import {getTranslator} from "next-intl/server";

export default async function Home({params:{locale}}:{params:{locale:"fa"|"en"|"ar"}}){
  const t = await getTranslator(locale);
  return (
    <section className="space-y-6">
      <div className="rounded-2xl p-8 bg-gradient-to-r from-sky-100 to-white shadow">
        <h1 className="text-3xl font-bold mb-2">{t("hero.title")}</h1>
        <p className="text-slate-600">{t("hero.subtitle")}</p>
        <a className="inline-block mt-6 btn bg-sky-600 text-white px-4 py-2 rounded-xl"
           href={`/${locale}/appointment`}>{t("cta.book")}</a>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <a className="p-6 rounded-xl border bg-white hover:shadow"
           href={`/${locale}/services`}>خدمات کلینیک</a>
        <a className="p-6 rounded-xl border bg-white hover:shadow"
           href={`/${locale}/doctors`}>پزشکان</a>
        <a className="p-6 rounded-xl border bg-white hover:shadow"
           href={`/${locale}/news`}>اخبار و مقالات</a>
      </div>
    </section>
  );
}
'@

  # چند صفحهٔ نمونهٔ فرعی
  $pages = @("services","doctors","news","appointment","contact")
  foreach($p in $pages){
    $dir = Join-Path $locDir $p
    Ensure-Dir $dir
    Write-Text (Join-Path $dir "page.tsx") @'
export default function Page(){ return (
  <div className="prose max-w-none">
    <h1 className="font-bold text-2xl mb-4">در حال تکمیل…</h1>
    <p>این صفحه یک شِمای اولیه است. محتوای واقعی را اینجا قرار دهید.</p>
  </div>
);}
'@
  }

  # Toast Provider سالم (رفع خطاهای قبلی)
  Write-Text (Join-Path $web "src/components/Toast.tsx") @'
"use client";
import React, {createContext, useCallback, useContext, useState} from "react";
type ToastItem = { id: number; text: string; type?: "success"|"error"|"info" };
type Ctx = { push: (text: string, type?: ToastItem["type"]) => void };
const ToastContext = createContext<Ctx>({ push: () => {} });
export const useToast = () => useContext(ToastContext);
export default function ToastProvider({children}:{children:React.ReactNode}){
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text:string, type:ToastItem["type"]="info")=>{
    const id = Date.now(); setItems(s=>[...s,{id,text,type}]);
    setTimeout(()=>setItems(s=>s.filter(x=>x.id!==id)), 3500);
  },[]);
  const Provider = ToastContext.Provider;
  return (
    <Provider value={{push}}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {items.map(i=>(
          <div key={i.id}
            className={`rounded-xl px-4 py-2 shadow bg-white/80 backdrop-blur border
              ${i.type==="error"?"border-red-400":"border-emerald-400"}`}>
            <span className="text-sm">{i.text}</span>
          </div>
        ))}
      </div>
    </Provider>
  );
}
'@

  Write-Host "✔ Website scaffolding done." -ForegroundColor Green

} finally { Pop-Location }

# ==== 2) Backend (Django) ====
if(-not (Test-Path $backend)){ throw "Backend folder not found: $backend" }
Push-Location $backend
try{
  Write-Host "`n[Backend] installing Python deps & local settings..." -ForegroundColor Cyan
  # وابستگی‌های ضروری
  pip install django-cors-headers djangorestframework djangorestframework-simplejwt django-jazzmin django-cleanup Pillow python-dotenv | Out-Null

  # settings_local.py (override غیرمخرب)
  $settingsDir = Join-Path $backend "koosha_api"
  $settingsPy  = Join-Path $settingsDir "settings.py"
  $settingsLocal = Join-Path $settingsDir "settings_local.py"

  if(-not (Test-Path $settingsPy)){ throw "settings.py not found at $settingsPy" }

  Append-IfMissing $settingsPy "settings_local import" @'
try:
    from .settings_local import *  # type: ignore  # noqa
except Exception:
    pass
'@

  Write-Text $settingsLocal @"
from datetime import timedelta

INSTALLED_APPS = list(INSTALLED_APPS) + ["corsheaders","rest_framework","jazzmin"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"] + list(MIDDLEWARE)

CORS_ALLOWED_ORIGINS = ["http://localhost:$webPort","http://localhost:3100"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:$webPort","http://localhost:3100"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(hours=6)}

JAZZMIN_SETTINGS = {
  "site_title": "مدیریت کوشا",
  "site_header": "پرتال ادمین",
  "welcome_sign": "به مدیریت کوشا خوش آمدید"
}
"@

  # .env ساده
  $envPath = Join-Path $backend ".env"
  if(-not (Test-Path $envPath)){
    Write-Text $envPath @"
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=change_me_strong_2025
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:$webPort
"@
  }

  # مهاجرت
  python manage.py migrate

  Write-Host "✔ Backend configured & migrated." -ForegroundColor Green
} finally { Pop-Location }

# ==== 3) Backup script (DB + media) ====
$scriptDir = Join-Path $root "ops"
Ensure-Dir $scriptDir
$backupScript = Join-Path $scriptDir "backup_koosha.ps1"

if($usePostgres){
  $pgDump = Join-Path $pgBin "pg_dump.exe"
  Write-Text $backupScript @"
param([string]\$dbName="koosha",[string]\$user="postgres",[string]\$backupRoot="$($root)\backups")
\$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType Directory -Force -Path \$backupRoot | Out-Null
& "$pgDump" -Fc --dbname=\$dbName --username=\$user --file (Join-Path \$backupRoot "db_\$stamp.dump")
robocopy "$($root)\media" (Join-Path \$backupRoot "media_\$stamp") /MIR | Out-Null
"@
} else {
  Write-Text $backupScript @"
param([string]\$backupRoot="$($root)\backups")
\$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType Directory -Force -Path \$backupRoot | Out-Null
Copy-Item "$backend\db.sqlite3" (Join-Path \$backupRoot "sqlite_\$stamp.db") -Force
robocopy "$($root)\media" (Join-Path \$backupRoot "media_\$stamp") /MIR | Out-Null
"@
}

Write-Host "✔ Backup script ready: $backupScript" -ForegroundColor Green

# زمان‌بندی (اختیاری – نیاز به اجرای پاورشل با دسترسی ادمین)
try{
  $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
  if($isAdmin){
    $action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-NoProfile -File `"$backupScript`""
    $trigger = New-ScheduledTaskTrigger -Daily -At 02:00
    Register-ScheduledTask -TaskName "Koosha-Backup" -Action $action -Trigger $trigger -Force | Out-Null
    Write-Host "✔ Scheduled task 'Koosha-Backup' created (daily 02:00)." -ForegroundColor Green
  } else {
    Write-Host "• Skipped scheduling (run PowerShell as Administrator to auto-schedule)." -ForegroundColor Yellow
  }
} catch { Write-Host "• Scheduling failed: $($_.Exception.Message)" -ForegroundColor Yellow }

Write-Host "`nALL DONE ✅" -ForegroundColor Green
Write-Host "Next.js dev server:  cd `"$web`" ; npm run dev -p $webPort" -ForegroundColor Cyan
Write-Host "Django server   :   cd `"$backend`" ; python manage.py runserver 0.0.0.0:8000" -ForegroundColor Cyan
