from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction
from django.apps import apps

class Command(BaseCommand):
    help = "Upsert (resourceId,sid) into TelehealthRoom.meta and print verify line"

    def add_arguments(self, parser):
        parser.add_argument("--room", required=True)
        parser.add_argument("--resourceId", required=True)
        parser.add_argument("--sid", required=True)

    def handle(self, *args, **opts):
        TelehealthRoom = apps.get_model("telehealth","TelehealthRoom")
        room = TelehealthRoom.objects.filter(uuid=opts["room"]).first()
        if not room:
            raise CommandError("room not found")
        meta = room.meta or {}
        changed = False
        if meta.get("resourceId") != opts["resourceId"]:
            meta["resourceId"] = opts["resourceId"]; changed=True
        if meta.get("sid") != opts["sid"]:
            meta["sid"] = opts["sid"]; changed=True
        if changed:
            room.meta = meta
            room.save(update_fields=["meta"])
        self.stdout.write(self.style.SUCCESS(f"room={room.uuid} resourceId={meta.get('resourceId')} sid={meta.get('sid')} upserted={changed}"))
