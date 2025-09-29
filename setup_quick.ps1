# D:\KooshaClean\setup_quick.ps1
$ErrorActionPreference = "Stop"

# مسیرها
$ROOT     = "D:\KooshaClean"
$BACKEND  = Join-Path $ROOT "backend"
$WEBSITE  = Join-Path $ROOT "website"

function Ensure-Dir([string]$p){
  if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null }
}
# نوشتن فایل UTF8 بدون BOM (بدون -Encoding)
function Write-Text([string]$path,[string]$content){
  Ensure-Dir ([System.IO.Path]::GetDirectoryName($path))
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path,$content,$enc)
  Write-Host "✓ $path" -ForegroundColor Green
}
function Write-Json($path,$obj){
  $json = $obj | ConvertTo-Json -Depth 20
  Write-Text $path $json
}

# ---------- 1) Backend: اصلاح import و اجرای مایگریت ----------
Write-Host "`n[backend] patching imports & running server..." -ForegroundColor Cyan
if(-not (Test-Path $BACKEND)){ throw "BACKEND not found: $BACKEND" }

# اگر جایی اشتباهاً Attachment از core.models import شده، تبدیل به sitecontent.models کن
Get-ChildItem -Path $BACKEND -Recurse -Filter "*.py" |
  Where-Object { (Get-Content $_.FullName -Raw) -match "from\s+core\.models\s+import\s+Attachment" } |
  ForEach-Object {
    $t = (Get-Content $_.FullName -Raw) -replace "from\s+core\.models\s+import\s+Attachment","from sitecontent.models import Attachment"
    Write-Text $_.FullName $t
    Write-Host "• fixed import in $($_.FullName)"
  }

# settings: فعال بودن CORS برای 3000
$settings = Join-Path $BACKEND "koosha_api\settings.py"
if(Test-Path $settings){
  $txt = Get-Content $settings -Raw
  if($txt -notmatch "corsheaders"){
    $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[","INSTALLED_APPS = [`r`n    'corsheaders',"
    $txt = $txt -replace "MIDDLEWARE\s*=\s*\[","MIDDLEWARE = [`r`n    'corsheaders.middleware.CorsMiddleware',"
  }
  if($txt -notmatch "CORS_ALLOWED_ORIGINS"){
    $txt += "`r`nCORS_ALLOWED_ORIGINS = ['http://localhost:3000','http://127.0.0.1:3000']`r`n"
  }
  # Celery/Redis اختیاری: اگر نبود، ارور نده
  if($txt -notmatch "CELERY_BROKER_URL"){
    $txt += "CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'`r`n"
  }
  Write-Text $settings $txt
}

Push-Location $BACKEND
python -m pip install -U pip >$null
pip install django djangorestframework django-cors-headers psycopg2-binary pillow >$null
python manage.py makemigrations
python manage.py migrate
Pop-Location

# ---------- 2) Frontend: پاکسازی، پین نسخه‌ها، فایل‌های ضروری ----------
Write-Host "`n[website] cleaning & installing deps..." -ForegroundColor Cyan
if(-not (Test-Path $WEBSITE)){ throw "WEBSITE not found: $WEBSITE" }

Push-Location $WEBSITE
# حذف node_modules و lock به روش درست پاورشل
if(Test-Path "node_modules"){ Remove-Item -Recurse -Force "node_modules" }
if(Test-Path "package-lock.json"){ Remove-Item -Force "package-lock.json" }
npm cache clean --force | Out-Null

# اگر package.json نیست، یک مینیمال بساز
if(-not (Test-Path "package.json")){
  Write-Text "package.json" (@"
{
  "name": "koosha-website",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000 -H 0.0.0.0",
    "build": "next build",
    "start": "next start -p 3000 -H 0.0.0.0"
  },
  "dependencies": {},
  "devDependencies": {}
}
"@)
}else{
  # اسکریپت dev را تنظیم کن
  $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
  if(-not $pkg.scripts){ $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue @{} }
  $pkg.scripts.dev   = "next dev -p 3000 -H 0.0.0.0"
  $pkg.scripts.build = "next build"
  $pkg.scripts.start = "next start -p 3000 -H 0.0.0.0"
  Write-Json "package.json" $pkg
}

# نصب نسخه‌های سازگار با React 18 / Next 14
npm i next@14.2.5 react@18.3.1 react-dom@18.3.1 `
  next-intl@3 framer-motion@11 fuse.js `
  react-leaflet@4 leaflet@1.9.4

# ابزارهای CSS/TS
npm i -D tailwindcss@3 postcss@8 autoprefixer@10 typescript@5 @types/leaflet@1.9

# فایل‌های کانفیگ
Write-Text "postcss.config.js" "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"
Write-Text "tailwind.config.js" @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: { colors: { brand: { DEFAULT:"#0ea5e9"} } } },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
"@

# ساختار پروژه و فایل‌های ضروری
Ensure-Dir "src/app"
Ensure-Dir "src/components"
Ensure-Dir "src/lib"
Ensure-Dir "src/messages"
# CSS سراسری
Write-Text "src/app/globals.css" @"
@tailwind base;
@tailwind components;
@tailwind utilities;
html[dir='rtl'] { direction: rtl; }
body { @apply bg-slate-50 text-slate-800 antialiased; }
.container { @apply max-w-6xl mx-auto; }
"@
# layout
Write-Text "src/app/layout.tsx" @"
import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'کلینیک کوشا', description: 'وبسایت رسمی کلینیک کوشا' };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (<html lang='fa' dir='rtl'><body className='container py-8'>{children}</body></html>);
}
"@
# صفحه خانه
Write-Text "src/app/page.tsx" @"
export default function Home(){
  return (
    <main className='space-y-8'>
      <section className='rounded-2xl p-8 bg-gradient-to-r from-sky-100 to-white'>
        <h1 className='text-3xl font-bold'>به کوشا خوش آمدید</h1>
        <p className='text-slate-600 mt-2'>نوبت‌ دهی، خدمات پاراکلینیک و اخبار</p>
        <a className='inline-block mt-4 bg-brand text-white rounded-xl px-4 py-2' href='/services'>رزرو نوبت</a>
      </section>
      <div className='grid md:grid-cols-3 gap-4'>
        <a className='p-6 bg-white rounded-xl shadow' href='/services'>خدمات کلینیک</a>
        <a className='p-6 bg-white rounded-xl shadow' href='/doctors'>پزشکان</a>
        <a className='p-6 bg-white rounded-xl shadow' href='/news'>اخبار و مقالات</a>
      </div>
    </main>
  )
}
"@
# lib/api.ts (اتصال ساده به بک‌اند)
Write-Text "src/lib/api.ts" @"
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
export async function getJSON(path:string){
  const r = await fetch(\`\${API_BASE}\${path}\`, { cache:'no-store' }); 
  if(!r.ok) throw new Error('API '+r.status); 
  return r.json();
}
"@

Pop-Location

# ---------- 3) اجرای سرویس‌ها ----------
Write-Host "`nStarting Django on :8000 and Next on :3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd `"$BACKEND`"; python manage.py runserver 0.0.0.0:8000"
Start-Process powershell -ArgumentList "cd `"$WEBSITE`"; npm run dev -p 3000"
Write-Host "`n✓ Backend: http://localhost:8000  |  ✓ Website: http://localhost:3000" -ForegroundColor Green
Write-Host "اگر صفحه باز نشد، لاگ دو ترمینال باز شده را ببین." -ForegroundColor Yellow
