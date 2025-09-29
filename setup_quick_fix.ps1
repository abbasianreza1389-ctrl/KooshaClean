# D:\KooshaClean\setup_quick_fix.ps1
$ErrorActionPreference = "Stop"

$ROOT    = "D:\KooshaClean"
$BACKEND = Join-Path $ROOT "backend"
$WEBSITE = Join-Path $ROOT "website"

function Ensure-Dir([string]$p){
  if([string]::IsNullOrWhiteSpace($p)){ return }
  if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null }
}
function Write-Text([string]$path,[string]$content){
  Ensure-Dir ([System.IO.Path]::GetDirectoryName($path))
  $enc = New-Object System.Text.UTF8Encoding($false)   # UTF-8 بدون BOM
  [System.IO.File]::WriteAllText($path,$content,$enc)
  Write-Host "✓ $path" -ForegroundColor Green
}
function Write-Json($path,$obj){ $json=$obj|ConvertTo-Json -Depth 20; Write-Text $path $json }

# -------------------- 1) Backend --------------------
Write-Host "`n[backend] fixing imports / creating Attachment if missing..." -ForegroundColor Cyan
if(-not (Test-Path $BACKEND)){ throw "BACKEND not found: $BACKEND" }

# 1.1: اگر app=sitecontent نبود، بساز
$siteApp = Join-Path $BACKEND "sitecontent"
if(-not (Test-Path $siteApp)){
  Push-Location $BACKEND
  & python "manage.py" "startapp" "sitecontent"
  Pop-Location
  Write-Host "• django app 'sitecontent' created"
}

# 1.2: تنظیم settings.py (افزودن sitecontent و corsheaders و CORS_ALLOWED_ORIGINS)
$settings = Get-ChildItem -Path $BACKEND -Recurse -Filter "settings.py" | Where-Object { $_.FullName -match "koosha_api" } | Select-Object -First 1
if(-not $settings){ throw "settings.py (koosha_api) not found" }
$txt = Get-Content $settings.FullName -Raw
if($txt -notmatch "'sitecontent'"){ $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[","INSTALLED_APPS = [`r`n    'sitecontent'," }
if($txt -notmatch "corsheaders"){
  $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[","INSTALLED_APPS = [`r`n    'corsheaders',"
  $txt = $txt -replace "MIDDLEWARE\s*=\s*\[","MIDDLEWARE = [`r`n    'corsheaders.middleware.CorsMiddleware',"
  if($txt -notmatch "CORS_ALLOWED_ORIGINS"){
    $txt += "`r`nCORS_ALLOWED_ORIGINS = ['http://localhost:3000','http://127.0.0.1:3000']`r`n"
  }
}
Write-Text $settings.FullName $txt

# 1.3: مدل Attachment حداقلی (اگر وجود ندارد)
$modelsPath = Join-Path $siteApp "models.py"
if(-not (Test-Path $modelsPath)){
  Write-Text $modelsPath @"
from django.db import models

class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title or self.file.name
"@
}

# 1.4: اصلاح همه‌ی importهای اشتباه Attachment
$patterns = @(
  'from\s+core\.models\s+import\s+Attachment',
  'from\s+core\.models\.attachment\s+import\s+Attachment'
)
Get-ChildItem -Path $BACKEND -Recurse -Filter "*.py" | ForEach-Object {
  $p=$_.FullName; $content = Get-Content $p -Raw
  $updated=$content
  foreach($rgx in $patterns){ $updated = [regex]::Replace($updated,$rgx,'from sitecontent.models import Attachment') }
  if($updated -ne $content){ Write-Text $p $updated; Write-Host "• fixed Attachment import in $p" }
}

# 1.5: نصب پکیج‌ها و مایگریت
Push-Location $BACKEND
python -m pip install -U pip >$null
pip install -q django djangorestframework django-cors-headers pillow
python manage.py makemigrations sitecontent
python manage.py migrate
Pop-Location

# -------------------- 2) Website (Next.js) --------------------
Write-Host "`n[website] cleaning & installing deps..." -ForegroundColor Cyan
if(-not (Test-Path $WEBSITE)){ throw "WEBSITE not found: $WEBSITE" }

Push-Location $WEBSITE
if(Test-Path "node_modules"){ Remove-Item -Recurse -Force "node_modules" }
if(Test-Path "package-lock.json"){ Remove-Item -Force "package-lock.json" }
npm cache clean --force | Out-Null

# package.json و اسکریپت‌ها
if(-not (Test-Path "package.json")){
  Write-Text "package.json" (@"
{
  "name":"koosha-website","private":true,"type":"module",
  "scripts":{"dev":"next dev -p 3000 -H 0.0.0.0","build":"next build","start":"next start -p 3000 -H 0.0.0.0"}
}
"@)
}else{
  $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
  if(-not $pkg.scripts){ $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue @{} }
  $pkg.scripts.dev   = "next dev -p 3000 -H 0.0.0.0"
  $pkg.scripts.build = "next build"
  $pkg.scripts.start = "next start -p 3000 -H 0.0.0.0"
  Write-Json "package.json" $pkg
}

# نسخه‌های سازگار (از Next 14.2.5 استفاده می‌کنیم تا تضاد وابستگی رخ ندهد)
npm i next@14.2.5 react@18.3.1 react-dom@18.3.1 next-intl@3 framer-motion@11 fuse.js react-leaflet@4 leaflet@1.9.4
npm i -D tailwindcss@3 postcss@8 autoprefixer@10 typescript@5 @types/leaflet@1.9 @tailwindcss/forms @tailwindcss/typography

Write-Text "postcss.config.js" "module.exports={plugins:{tailwindcss:{},autoprefixer:{}}}"
Write-Text "tailwind.config.js" @"
/** @type {import('tailwindcss').Config} */
module.exports={content:['./src/**/*.{ts,tsx,js,jsx}'],
theme:{extend:{colors:{brand:{DEFAULT:'#0ea5e9'}}}},plugins:[require('@tailwindcss/forms'),require('@tailwindcss/typography')]}
"@

Ensure-Dir "src/app"; Ensure-Dir "src/components"; Ensure-Dir "src/lib"; Ensure-Dir "src/messages"

Write-Text "src/app/globals.css" @"
@tailwind base; @tailwind components; @tailwind utilities;
html[dir='rtl']{direction:rtl}
body{@apply bg-slate-50 text-slate-800 antialiased}
.container{@apply max-w-6xl mx-auto}
"@

Write-Text "src/app/layout.tsx" @"
import './globals.css'; import type { Metadata } from 'next';
export const metadata: Metadata = { title:'کلینیک کوشا', description:'وبسایت رسمی کلینیک کوشا' };
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang='fa' dir='rtl'><body className='container py-8'>{children}</body></html>)}
"@

Write-Text "src/app/page.tsx" @"
export default function Home(){return(<main className='space-y-8'>
<section className='rounded-2xl p-8 bg-gradient-to-r from-sky-100 to-white'><h1 className='text-3xl font-bold'>به کوشا خوش آمدید</h1>
<p className='text-slate-600 mt-2'>نوبت‌دهی، خدمات پاراکلینیک و اخبار</p><a className='inline-block mt-4 bg-brand text-white rounded-xl px-4 py-2' href='/services'>رزرو نوبت</a></section>
<div className='grid md:grid-cols-3 gap-4'><a className='p-6 bg-white rounded-xl shadow' href='/services'>خدمات کلینیک</a>
<a className='p-6 bg-white rounded-xl shadow' href='/doctors'>پزشکان</a><a className='p-6 bg-white rounded-xl shadow' href='/news'>اخبار و مقالات</a></div></main>)}
"@

Write-Text "src/lib/api.ts" "export const API_BASE=process.env.NEXT_PUBLIC_API_BASE??'http://localhost:8000'; export async function getJSON(p){const r=await fetch(API_BASE+p,{cache:'no-store'}); if(!r.ok) throw new Error('API '+r.status); return r.json();}"

Pop-Location

# -------------------- 3) Start Servers --------------------
Write-Host "`nStarting Django(:8000) and Next(:3000) ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd `"$BACKEND`"; python manage.py runserver 0.0.0.0:8000"
Start-Process powershell -ArgumentList "cd `"$WEBSITE`"; npm run dev -p 3000"
Write-Host "`n✓ Backend: http://localhost:8000    ✓ Website: http://localhost:3000" -ForegroundColor Green
