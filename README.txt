مراحل اجرا:
1) فایل زیپ را در ریشه ریپو اکسترکت کنید (پوشه‌ها: backend/, website/, فایل APPLY_PRO_UPGRADE.ps1).
2) پاورشل (Admin) باز کنید و بزنید:
   powershell -NoProfile -ExecutionPolicy Bypass -File "D:\KooshaClean\APPLY_PRO_UPGRADE.ps1" -Repo "D:\KooshaClean"
3) بعد از پایان، Backend روی 8000 و Website روی 3000 را اجرا کنید.
