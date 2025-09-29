# Koosha Roadmap Kit — راه‌انداز یک‌کلیکی

## سریع‌ترین مسیر (Windows / PowerShell)
> پوشه‌ی پروژه شما باید شامل `backend` و `website` باشد (در صورت خالی بودن هم اسکریپت‌ها می‌سازند).

```powershell
# 0) اجرای همه‌چیز (ساخت venv، بک‌اند تمیز+اسکلت، فرانت، سید داده، E2E اسموک)
.\scripts\00_all_in_one.ps1 -BackendDir backend -ProjectName koosha_api -WebDir website -ApiPort 8000 -NextPort 3000 -AdminUser admin -AdminPass adminpass
```

### اجرای جزءبه‌جزء
```powershell
# 1) بک‌اند و اسکلت‌ها
.\scripts\01_apply_backend_patch.ps1 -BackendDir backend -ProjectName koosha_api -PythonPath .\.venv\Scripts\python.exe

# 2) فرانت
.\scripts\02_apply_front_patch.ps1 -WebDir website -NextPort 3000 -ApiBase http://localhost:8000

# 3) داده نمونه
.\scripts\03_seed_demo.ps1 -BackendDir backend -ProjectName koosha_api -PythonPath .\.venv\Scripts\python.exe

# 4) تست سرتاسری سبک
.\scripts\04_e2e_smoke.ps1 -Api http://localhost:8000

# 5) گزارش وضعیت/پیشرفت
.\scripts\05_progress_status.ps1 -Api http://localhost:8000 -Web http://localhost:3000
```
