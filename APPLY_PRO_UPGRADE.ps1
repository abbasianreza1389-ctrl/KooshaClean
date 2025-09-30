Param([string]$Repo = "D:\KooshaClean")

function Info($t){ Write-Host $t -ForegroundColor Cyan }
function Ok($t){ Write-Host $t -ForegroundColor Green }
function Warn($t){ Write-Host $t -ForegroundColor Yellow }

Set-Location $Repo
git checkout -b feature/pro-upgrade-mvp 2>$null

$pack = Split-Path -Parent $MyInvocation.MyCommand.Path

# Copy backend files
Copy-Item -Recurse -Force "$pack\backend\news" "$Repo\backend\news"
Copy-Item -Recurse -Force "$pack\backend\catalog" "$Repo\backend\catalog"
if (!(Test-Path "$Repo\backend\common\health.py")) {
  New-Item -ItemType Directory -Force "$Repo\backend\common" | Out-Null
  Copy-Item -Force "$pack\backend\common\health.py" "$Repo\backend\common\health.py"
}

# Fix urls.py and include routes
$urls = "$Repo\backend\koosha_api\urls.py"
if (Test-Path $urls) {
  $txt = Get-Content $urls -Raw
  $txt = $txt -replace "\bath\b", "path" -replace "\bpatph\b", "path"
  if ($txt -notmatch "from common\.health import healthz") {
    $txt = $txt -replace "urlpatterns = \[", "from common.health import healthz`nurlpatterns = ["
  }
  if ($txt -notmatch "path\('healthz/'") {
    $txt = $txt -replace "path\('admin/', admin.site.urls\),", "path('admin/', admin.site.urls),`n    path('healthz/', healthz),"
  }
  if ($txt -notmatch "news.urls") {
    $txt = $txt -replace "path\('api/', include\('portal.urls'\)\),", "path('api/', include('portal.urls')),\n    path('api/', include('news.urls')),\n    path('api/', include('catalog.urls')),"
  }
  Set-Content $urls $txt -Encoding UTF8
}

# settings.py: ensure apps
$settings = "$Repo\backend\koosha_api\settings.py"
if (Test-Path $settings) {
  $txt = Get-Content $settings -Raw
  if ($txt -notmatch "'news'")    { $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[", "INSTALLED_APPS = [ 'news'," }
  if ($txt -notmatch "'catalog'") { $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[", "INSTALLED_APPS = [ 'catalog'," }
  if ($txt -notmatch "'drf_spectacular'") { $txt = $txt -replace "INSTALLED_APPS\s*=\s*\[", "INSTALLED_APPS = [ 'drf_spectacular'," }
  Set-Content $settings $txt -Encoding UTF8
}

# Website content
Copy-Item -Recurse -Force "$pack\website\src" "$Repo\website\src"
Copy-Item -Recurse -Force "$pack\website\messages" "$Repo\website\messages"

# tsconfig alias patch
$tscfg = "$Repo\website\tsconfig.json"
if (Test-Path $tscfg) {
  $json = Get-Content $tscfg -Raw | ConvertFrom-Json
  if (-not $json.compilerOptions) { $json | Add-Member -NotePropertyName compilerOptions -NotePropertyValue @{} }
  if (-not $json.compilerOptions.baseUrl) { $json.compilerOptions.baseUrl = "." }
  if (-not $json.compilerOptions.paths) { $json.compilerOptions.paths = @{} }
  if (-not $json.compilerOptions.paths."@/*") { $json.compilerOptions.paths."@/*" = @("src/*") }
  $json | ConvertTo-Json -Depth 10 | Set-Content $tscfg -Encoding UTF8
} else {
  Copy-Item -Force "$pack\website\tsconfig.patch.json" $tscfg
}

# package.json ensure scripts + next-intl dep
$pkg = "$Repo\website\package.json"
if (Test-Path $pkg) {
  $p = Get-Content $pkg -Raw | ConvertFrom-Json
  if (-not $p.scripts) { $p | Add-Member -NotePropertyName scripts -NotePropertyValue @{} }
  $p.scripts.dev   = "next dev -p 3000 -H 0.0.0.0"
  $p.scripts.build = "next build"
  $p.scripts.start = "next start -p 3000 -H 0.0.0.0"
  if (-not $p.dependencies) { $p | Add-Member -NotePropertyName dependencies -NotePropertyValue @{} }
  if (-not $p.dependencies."next-intl") { $p.dependencies."next-intl" = "3.x" }
  $p | ConvertTo-Json -Depth 10 | Set-Content $pkg -Encoding UTF8
}

# Dev docker (optional)
Copy-Item -Force "$pack\docker-compose.dev.yml" "$Repo\docker-compose.dev.yml"
Copy-Item -Force "$pack\backend\Dockerfile" "$Repo\backend\Dockerfile.dev"
Copy-Item -Force "$pack\website\Dockerfile" "$Repo\website\Dockerfile.dev"

# Install + migrate
Push-Location "$Repo\website"; npm i; Pop-Location
Push-Location "$Repo\backend"
python manage.py makemigrations news
python manage.py migrate
Pop-Location

# Commit & push
git add -A
git commit -m "feat: pro upgrade (news, healthz, catalog MVP, next-intl layout, alias, dev docker)"
git push -u origin HEAD
