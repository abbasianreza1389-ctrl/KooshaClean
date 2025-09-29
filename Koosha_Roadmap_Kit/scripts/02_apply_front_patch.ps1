param(
  [string]$WebDir   = "website",
  [int]   $NextPort = 3000,
  [string]$ApiBase  = "http://localhost:8000"
)
$ErrorActionPreference="Stop"

# Layout + globals.css + page.tsx minimal (if missing)
function Ensure-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } }
Ensure-Dir (Join-Path $WebDir "src\app")

Set-Content -Encoding UTF8 (Join-Path $WebDir ".env.local") ("NEXT_PUBLIC_API=$ApiBase")

Set-Content -Encoding UTF8 (Join-Path $WebDir "src\app\layout.tsx") @"
import './globals.css';
export const metadata = { title: 'Koosha', description: 'Koosha MVP' };
export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (<html lang='fa' dir='rtl'><body>{children}</body></html>);
}
"@

Set-Content -Encoding UTF8 (Join-Path $WebDir "src\app\globals.css") @"
@tailwind base;
@tailwind components;
@tailwind utilities;
html[dir='rtl']{direction:rtl}
.container{max-width:72rem;margin-inline:auto;padding-inline:1rem}
.card{border:1px solid rgba(0,0,0,.05);border-radius:.75rem;background:#fff;padding:1.25rem}
"@

if(!(Test-Path (Join-Path $WebDir "src\app\page.tsx"))){
Set-Content -Encoding UTF8 (Join-Path $WebDir "src\app\page.tsx") @"
'use client';
export default function Home(){
  return (<main dir='rtl' className='container py-6'><h1 className='text-2xl font-bold mb-4'>به کوشا خوش آمدید</h1><div className='card'>صفحه نمونه</div></main>);
}
"@
}

# Tailwind configs
Set-Content -Encoding UTF8 (Join-Path $WebDir "tailwind.config.js") @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}','./app/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
"@
Set-Content -Encoding UTF8 (Join-Path $WebDir "postcss.config.js") "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"

Write-Host "✅ Frontend patched. Run Next on port $NextPort" -ForegroundColor Green
