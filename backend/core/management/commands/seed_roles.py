from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
ROLES = ['admin','reception','accounting','provider','supervisor']
class Command(BaseCommand):
    help = "Seed base roles/groups"
    def handle(self, *args, **kwargs):
        for r in ROLES:
            Group.objects.get_or_create(name=r)
        self.stdout.write(self.style.SUCCESS("Roles ensured"))
