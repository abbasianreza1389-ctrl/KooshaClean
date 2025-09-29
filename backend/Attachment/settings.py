INSTALLED_APPS += [
    "django.contrib.contenttypes",   # اگر نبود
    "django_cleanup.apps.CleanupConfig",  # حذف خودکار فایل قدیمی
]

# فایل‌ها
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL  = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# (اختیاری) محدودیت‌های آپلود
DATA_UPLOAD_MAX_MEMORY_SIZE = 26214400      # 25MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 26214400
