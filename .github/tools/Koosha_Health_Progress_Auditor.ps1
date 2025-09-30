
# ==== Koosha – Deep Health & Progress Auditor ====
Param(
  [string]$Repo = "D:\KooshaClean"
)
$ErrorActionPreference = "SilentlyContinue"

# ---------- Helpers ----------
function Title($t){ Write-Host "`n== $t ==" -ForegroundColor Cyan }
function Sub($t){ Write-Host $t -ForegroundColor Yellow }
function Row($k,$v){ "{0,-40} {1}" -f $k, $v }
function Bar([double]$pct){ $n=[math]::Round($pct/5); "[{0}{1}] {2}%" -f ('#'*$n),('-'*(20-$n)),("{0:N1}" -f $pct) }
function Hit($u){ try{ (Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 3).StatusCode } catch { 0 } }
function FindInFiles($path,$pattern){
  try { return Select-String -Path (Join-Path $path "*") -Pattern $pattern -Recurse -List -ErrorAction SilentlyContinue } catch { return $null }
}
function NewSection($name,$weight){
  [pscustomobject]@{ Name=$name; Weight=$weight; Checks=@(); Pass=0; Total=0; Score=0.0; Weighted=0.0 }
}
function AddCheck([ref]$S, $label, $ok, $detail=$null){
  $S.Value.Total++
  if($ok){ $S.Value.Pass++ }
  $S.Value.Checks += [pscustomobject]@{ label=$label; passed=[bool]$ok; detail=$detail }
}

# ---------- Repo facts ----------
Title "Collecting facts"
$paths = @{
  git            = (Join-Path $Repo ".git")
  urls           = (Join-Path $Repo "backend\koosha_api\urls.py")
  settings       = (Join-Path $Repo "backend\koosha_api\settings.py")
  requirements   = (Join-Path $Repo "backend\requirements.txt")
  health_py      = (Join-Path $Repo "backend\common\health.py")
  news_dir       = (Join-Path $Repo "backend\news")
  catalog_dir    = (Join-Path $Repo "backend\catalog")
  workflows_dir  = (Join-Path $Repo ".github\workflows")
  docker_dev     = (Join-Path $Repo "docker-compose.dev.yml")
  dockerfile_be  = (Join-Path $Repo "backend\Dockerfile*")
  dockerfile_fe  = (Join-Path $Repo "website\Dockerfile*")
  website_root   = (Join-Path $Repo "website")
  pkg_json       = (Join-Path $Repo "website\package.json")
  ts_json        = (Join-Path $Repo "website\tsconfig.json")
  middleware     = (Join-Path $Repo "website\src\middleware.ts")
  page_locale    = (Join-Path $Repo "website\src\app\[locale]\page.tsx")
  page_services  = (Join-Path $Repo "website\src\app\[locale]\services\page.tsx")
  page_doctors   = (Join-Path $Repo "website\src\app\[locale]\doctors\page.tsx")
  page_book      = (Join-Path $Repo "website\src\app\[locale]\book\page.tsx")
  page_posts     = (Join-Path $Repo "website\src\app\[locale]\posts\page.tsx")
  gitignore      = (Join-Path $Repo ".gitignore")
  tests_backend  = (Join-Path $Repo "backend\**\tests*")
  tests_website  = (Join-Path $Repo "website\**\*.test.*")
}
$exists = @{}
$paths.Keys | ForEach-Object { $exists[$_] = Test-Path $paths[$_] }
$urlsTxt = if($exists.urls){ Get-Content $paths.urls -Raw } else { "" }
$setTxt  = if($exists.settings){ Get-Content $paths.settings -Raw } else { "" }
$reqTxt  = if($exists.requirements){ Get-Content $paths.requirements -Raw } else { "" }
$pkg     = if($exists.pkg_json){ Get-Content $paths.pkg_json -Raw | ConvertFrom-Json } else { $null }
$ts      = if($exists.ts_json){ Get-Content $paths.ts_json -Raw | ConvertFrom-Json } else { $null }
$giTxt   = if($exists.gitignore){ Get-Content $paths.gitignore -Raw } else { "" }

Write-Host (Row "Repository" $Repo)
if($exists.git){
  $branch = (git -C $Repo rev-parse --abbrev-ref HEAD) 2>$null
  $last   = (git -C $Repo log -1 --pretty="%h %ad %an: %s" --date=iso) 2>$null
  Write-Host (Row "Git branch" ($branch ?? "—"))
  Write-Host (Row "Last commit" ($last ?? "—"))
}else{
  Write-Host (Row "Git" "❌ not a repo")
}

# ---------- Runtime probes (if running locally) ----------
Sub "[Runtime Probes]"
$E = [ordered]@{}
$E["/healthz/"]         = Hit "http://localhost:8000/healthz/"
$E["/api/services/"]    = Hit "http://localhost:8000/api/services/"
$E["/api/doctors/"]     = Hit "http://localhost:8000/api/doctors/"
$E["/api/posts/"]       = Hit "http://localhost:8000/api/posts/"
$E["/fa (website:3000)"]= Hit "http://localhost:3000/fa"
$E.Keys | ForEach-Object { Write-Host (Row $_ $E[$_]) }

# ---------- Versions ----------
Sub "[Versions]"
$pyExe = if(Test-Path (Join-Path $Repo ".venv\Scripts\python.exe")){ Join-Path $Repo ".venv\Scripts\python.exe" } else { "python" }
$pyVer = (& $pyExe --version) 2>&1
$nodeVer = (& node -v) 2>&1
$npmVer  = (& npm -v) 2>&1
Write-Host (Row "Python" $pyVer)
Write-Host (Row "Node"   $nodeVer)
Write-Host (Row "npm"    $npmVer)

# ---------- Sections (weights sum = 100) ----------
$S1 = NewSection "DevOps/Baseline"                    18
$S2 = NewSection "Backend API & Auth"                 24
$S3 = NewSection "Scheduling & Booking"               18
$S4 = NewSection "Payments & Insurance"               16
$S5 = NewSection "Website, i18n & UX"                 16
$S6 = NewSection "Security & Observability"            5
$S7 = NewSection "Telehealth"                          3
$Sections = @($S1,$S2,$S3,$S4,$S5,$S6,$S7)

# --- S1 DevOps/Baseline ---
AddCheck ([ref]$S1) ".git موجود است"                  $exists.git
AddCheck ([ref]$S1) ".github/workflows/"              $exists.workflows_dir
AddCheck ([ref]$S1) "docker-compose.dev.yml"          $exists.docker_dev
AddCheck ([ref]$S1) "Dockerfile backend (dev/…)"      (FindInFiles (Join-Path $Repo "backend") "FROM python" -ne $null)
AddCheck ([ref]$S1) "Dockerfile website (dev/…)"      (FindInFiles (Join-Path $Repo "website") "FROM node"   -ne $null)
AddCheck ([ref]$S1) "health.py (backend/common)"      $exists.health_py
AddCheck ([ref]$S1) "healthz در urls.py"              ($urlsTxt -match "healthz")
AddCheck ([ref]$S1) "تایپوهای path() در urls.py"     (-not (($urlsTxt -match "\bath\b") -or ($urlsTxt -match "\bpatph\b")))
AddCheck ([ref]$S1) ".gitignore شامل .venv/node_modules" (($giTxt -match "\.venv") -and ($giTxt -match "node_modules"))

# --- S2 Backend API & Auth ---
AddCheck ([ref]$S2) "DRF در INSTALLED_APPS"           ($setTxt -match "rest_framework")
AddCheck ([ref]$S2) "drf_spectacular در INSTALLED_APPS" ($setTxt -match "drf_spectacular")
AddCheck ([ref]$S2) "JWT routes در urls.py"           ($urlsTxt -match "auth/jwt/create")
AddCheck ([ref]$S2) "portal.urls در urls.py"          ($urlsTxt -match "portal\.urls")
AddCheck ([ref]$S2) "news app وجود دارد"             $exists.news_dir
AddCheck ([ref]$S2) "news.urls در urls.py"            ($urlsTxt -match "news\.urls")
AddCheck ([ref]$S2) "POSTS endpoint (200 اگر درحال اجرا)" ($E["/api/posts/"] -eq 200)
# python imports (best-effort)
$pyImp = @{ }
$pyImp.django = (& $pyExe -c "import django,sys;print(django.get_version())" ) 2>&1
$pyImp.drf    = (& $pyExe -c "import rest_framework,sys;print(getattr(rest_framework,'__version__','ok'))" ) 2>&1
$pyImp.spect  = (& $pyExe -c "import drf_spectacular,sys;print(getattr(drf_spectacular,'__version__','ok'))" ) 2>&1
AddCheck ([ref]$S2) "Python import django"            ($LASTEXITCODE -eq 0 -or ($pyImp.django -match "^\d+"))
AddCheck ([ref]$S2) "Python import DRF"               ($pyImp.drf -notmatch "No module")
AddCheck ([ref]$S2) "Python import drf_spectacular"   ($pyImp.spect -notmatch "No module")

# --- S3 Scheduling & Booking ---
AddCheck ([ref]$S3) "catalog app وجود دارد"          $exists.catalog_dir
AddCheck ([ref]$S3) "catalog.urls در urls.py"         ($urlsTxt -match "catalog\.urls")
AddCheck ([ref]$S3) "GET /api/services/ (200)"        ($E["/api/services/"] -eq 200)
AddCheck ([ref]$S3) "GET /api/doctors/ (200)"         ($E["/api/doctors/"] -eq 200)
AddCheck ([ref]$S3) "endpoint رزرو /appointments"    ($urlsTxt -match "appointments")
# advanced readiness signals:
$hasRRULE  = (FindInFiles (Join-Path $Repo "backend") "rrule|recurrence" -ne $null)
$hasTZ     = (FindInFiles (Join-Path $Repo "backend") "zoneinfo|pytz|timezone" -ne $null)
$hasConflict = (FindInFiles (Join-Path $Repo "backend") "overlap|conflict" -ne $null)
AddCheck ([ref]$S3) "آمادگی RRULE/DST (نشانه کد)"    $hasRRULE
AddCheck ([ref]$S3) "آمادگی منطقه زمانی (نشانه کد)"  $hasTZ
AddCheck ([ref]$S3) "جلوگیری از تداخل (نشانه کد)"    $hasConflict

# --- S4 Payments & Insurance ---
$hasPayKW   = (FindInFiles $Repo "payment|gateway|stripe|zarinpal|idpay|nextpay|mellat" -ne $null)
$hasWebhook = (FindInFiles (Join-Path $Repo "backend") "webhook" -ne $null)
$hasInsKW   = (FindInFiles (Join-Path $Repo "backend") "insurance|claim|coverage|adjudication|settlement" -ne $null)
AddCheck ([ref]$S4) "کلیدواژه‌های پرداخت (کد/تنظیمات)" $hasPayKW
AddCheck ([ref]$S4) "وب‌هوک پرداخت (نشانه کد/urls)"     $hasWebhook
AddCheck ([ref]$S4) "کلیدواژه‌های بیمه/Claim"           $hasInsKW
AddCheck ([ref]$S4) "requirements: درگاه/SDK"            ($reqTxt -match "stripe|zarinpal|idpay|opentelemetry")  # نشانه پیشرفت

# --- S5 Website, i18n & UX ---
$hasNextIntl = $false
if($pkg){ $hasNextIntl = ($pkg.dependencies."next-intl" -ne $null) -or ($pkg.devDependencies."next-intl" -ne $null) }
$aliasOK = $false
if($ts){ try { $aliasOK = $ts.compilerOptions.paths."@/*" -ne $null } catch { $aliasOK=$false } }
AddCheck ([ref]$S5) "middleware.ts (i18n)"            $exists.middleware
AddCheck ([ref]$S5) "صفحه /[locale]/page.tsx"         $exists.page_locale
AddCheck ([ref]$S5) "صفحه services"                   $exists.page_services
AddCheck ([ref]$S5) "صفحه doctors"                    $exists.page_doctors
AddCheck ([ref]$S5) "صفحه book"                       $exists.page_book
AddCheck ([ref]$S5) "صفحه posts"                      $exists.page_posts
AddCheck ([ref]$S5) "next-intl در package.json"       $hasNextIntl
AddCheck ([ref]$S5) "alias @/* در tsconfig"           $aliasOK
AddCheck ([ref]$S5) "وبسایت درحال اجرا (/fa 200)"     ($E["/fa (website:3000)"] -eq 200)

# --- S6 Security & Observability ---
$hasCORS  = ($setTxt -match "corsheaders")
$hasSEC   = ($setTxt -match "SECURE_|CSRF_")
$hasOTel  = ($reqTxt -match "opentelemetry|otel|sentry")
AddCheck ([ref]$S6) "CORS در settings"                 $hasCORS
AddCheck ([ref]$S6) "تنظیمات امنیتی (SECURE_/CSRF_)"  $hasSEC
AddCheck ([ref]$S6) "Observability (OTel/Sentry reqs)" $hasOTel
AddCheck ([ref]$S6) "healthz (200 اگر درحال اجرا)"     ($E["/healthz/"] -eq 200)

# --- S7 Telehealth ---
$hasTeleKW = (FindInFiles $Repo "telehealth|video|webrtc|twilio|jitsi" -ne $null)
AddCheck ([ref]$S7) "کلیدواژه‌های تل‌هلث"             $hasTeleKW

# ---------- Score calculation ----------
$OverallWeighted = 0
foreach($S in $Sections){
  if($S.Total -gt 0){ $S.Score = [math]::Round(($S.Pass/$S.Total)*100,1) } else { $S.Score = 0.0 }
  $S.Weighted = [math]::Round($S.Score * $S.Weight / 100, 1)
  $OverallWeighted += $S.Weighted
}

# ---------- Console output ----------
Title "Progress by Section"
$Sections | ForEach-Object {
  Write-Host (Row ($_.Name + " (w=" + $_.Weight + ")") ("{0}%  {1}" -f $_.Score, (Bar($_.Score))))
  foreach($c in $_.Checks){
    $mark = if($c.passed){"✅"}else{"❌"}
    Write-Host ("  - {0} {1}" -f $mark, $c.label)
  }
}
Write-Host ""
Write-Host (Row "Overall Progress (weighted)" ("{0}%" -f ("{0:N1}" -f $OverallWeighted))) -ForegroundColor Green
Write-Host (Bar($OverallWeighted)) -ForegroundColor Green

# ---------- Write Markdown & JSON ----------
$md = @("# Koosha – Health & Progress Report",
"**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
"",
"## Summary",
"*Overall Progress (weighted):* **{0}%**  ".Replace("{0}",("{0:N1}" -f $OverallWeighted)),
"",
"## Sections")
foreach($S in $Sections){
  $md += ("### {0} — {1}% (weight {2}, {3}/{4} checks)" -f $S.Name,$S.Score,$S.Weight,$S.Pass,$S.Total)
  foreach($c in $S.Checks){
    $md += ("- {0} {1}" -f ($(if($c.passed){"[x]"}else{"[ ]"}), $c.label))
  }
  $md += ""
}
$md += "## Runtime Probes (if servers running locally)"
$E.Keys | ForEach-Object { $md += ("- `{0}` → **{1}**" -f $_, $E[$_]) }

$mdPath = Join-Path $Repo "STATUS_REPORT.md"
$md -join "`r`n" | Set-Content $mdPath -Encoding UTF8

# JSON output
$json = @{
  generated = (Get-Date).ToString("o")
  repo = $Repo
  overall_weighted = [math]::Round($OverallWeighted,1)
  sections = ($Sections | ForEach-Object {
    @{
      name=$_.Name; weight=$_.Weight; score=$_.Score; weighted=$_.Weighted;
      checks = ($_.Checks | ForEach-Object { @{ label=$_.label; passed=$_.passed } })
    }
  })
  runtime = $E
}
$jsonPath = Join-Path $Repo "status_report.json"
$json | ConvertTo-Json -Depth 6 | Set-Content $jsonPath -Encoding UTF8

Write-Host "`nSaved:" -ForegroundColor Cyan
Write-Host (" - " + $mdPath)
Write-Host (" - " + $jsonPath)
# ==== end ====
