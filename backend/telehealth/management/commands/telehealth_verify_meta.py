from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from django.db import transaction
try:
    from telehealth.models import TelehealthRoom
except Exception:
    TelehealthRoom=None

class Command(BaseCommand):
    help = "Check that TelehealthRoom.meta stores resourceId/sid after recording_start"
    def handle(self,*a,**k):
        if not TelehealthRoom:
            self.stdout.write(self.style.ERROR("TelehealthRoom not found")); return
        r = TelehealthRoom.objects.order_by("-created_at").first()
        if not r or not isinstance(r.meta, dict):
            self.stdout.write(self.style.WARNING("No room or no meta yet"))
            return
        ok = all(x in r.meta for x in ("resourceId","sid"))
        self.stdout.write(self.style.SUCCESS(f"room={r.uuid} meta_ok={ok} meta_keys={list(r.meta.keys())[:5]}"))
