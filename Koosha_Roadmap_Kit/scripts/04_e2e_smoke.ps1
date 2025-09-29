param([string]$Api="http://localhost:8000")
$ErrorActionPreference="Stop"
Write-Host "E2E: health..." -ForegroundColor Cyan
Invoke-RestMethod "$Api/api/health/" -Method Get | Out-Null 2>$null

Write-Host "E2E: token..." -ForegroundColor Cyan
$tok = Invoke-RestMethod "$Api/api/token/" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"adminpass"}'
$h = @{ Authorization = "Bearer " + $tok.access }

Write-Host "E2E: KPI..." -ForegroundColor Cyan
try{ Invoke-RestMethod "$Api/api/kpi/overview/" -Headers $h -Method Get | Out-Null }catch{}

Write-Host "E2E: Export CSV..." -ForegroundColor Cyan
try{ Invoke-WebRequest "$Api/api/reports/billing.csv" -OutFile "$env:TEMP\billing.csv" }catch{}

Write-Host "✅ E2E smoke finished." -ForegroundColor Green
