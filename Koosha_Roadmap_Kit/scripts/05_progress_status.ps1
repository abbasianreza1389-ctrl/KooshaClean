param([string]$Api="http://localhost:8000", [string]$Web="http://localhost:3000")
function Check($name,$url){ try{ (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5 | Out-Null); "{0}: OK" -f $name } catch { "{0}: FAIL" -f $name } }
$items = @(
  (Check "API health" "$Api/api/health/"),
  (Check "API token" "$Api/api/token/"),
  (Check "KPI overview" "$Api/api/kpi/overview/"),
  (Check "Website root" "$Web/")
)
$items | ForEach-Object { $_ }
