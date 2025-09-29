Param([string]$Repo = "D:\KooshaClean")
Set-Location $Repo
git checkout -b feature/i18n-book-jwt 2>$null

$packRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item -Recurse -Force "$packRoot\backend\*" "$Repo\backend\"
Copy-Item -Recurse -Force "$packRoot\website\*" "$Repo\website\"

Push-Location "$Repo\website"; npm i next-intl@3; Pop-Location

# Patch settings/urls for news app if not present
$settings = "$Repo\backend\koosha_api\settings.py"
$urls = "$Repo\backend\koosha_api\urls.py"
if (Test-Path $settings) {
  $txt = Get-Content $settings -Raw
  if ($txt -notmatch "['" + 'news' + "']") {
    $txt = $txt.replace("INSTALLED_APPS = [", "INSTALLED_APPS = [ 'news',")
    Set-Content $settings $txt
  }
}
if (Test-Path $urls) {
  $txt = Get-Content $urls -Raw
  if ($txt -notmatch "news.urls") {
    $txt = $txt.replace("path('api/', include('portal.urls')),", "path('api/', include('portal.urls')),\n    path('api/', include('news.urls')),")
    Set-Content $urls $txt
  }
}

Push-Location "$Repo\backend"
python manage.py makemigrations news
python manage.py migrate
Pop-Location

git add -A
git commit -m "feat: i18n (next-intl), services/doctors wired to API, posts API, JWT login + portal"
git push -u origin HEAD
