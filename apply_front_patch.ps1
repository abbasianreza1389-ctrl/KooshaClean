param(
  [string]$WebDir   = "website",
  [int]   $NextPort = 3000,
  [string]$ApiBase  = "http://localhost:8000"
)
$ErrorActionPreference="Stop"
# set env
Set-Content -Encoding UTF8 (Join-Path $WebDir ".env.local") ("NEXT_PUBLIC_API=$ApiBase")

# pages
$base = Join-Path $WebDir "src\app"
$pages = @("admin-dashboard","reception","accounting")
foreach($p in $pages){
  $dir = Join-Path $base $p
  if(!(Test-Path $dir)){ New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $f = Join-Path $dir "page.tsx"
  @"
'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API || '$ApiBase';
export default function Page(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{ fetch(`${API}/api/kpi/overview/`).then(r=>r.json()).then(setData).catch(()=>setData({error:true})); },[]);
  return (
    <main dir="rtl" className="container py-6">
      <h1 className="text-xl font-bold mb-4">$p</h1>
      <pre className="card whitespace-pre-wrap">{JSON.stringify(data,null,2)}</pre>
    </main>
  )
}
"@ | Set-Content -Encoding UTF8 $f
}
Write-Host "✅ Frontend pages stubbed. Start Next on port $NextPort." -ForegroundColor Green
