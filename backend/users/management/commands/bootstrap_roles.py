from django.core.management.base import BaseCommand
from users.models import ensure_roles

class Command(BaseCommand):
    help = 'Create default RBAC groups'
    def handle(self, *args, **kwargs):
        ensure_roles(); self.stdout.write(self.style.SUCCESS('RBAC roles ensured.'))
