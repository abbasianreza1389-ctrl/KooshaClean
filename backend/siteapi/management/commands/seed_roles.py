from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
class Command(BaseCommand):
    help = 'Create default groups'
    def handle(self, *args, **kwargs):
        for n in ['manager','accountant','reception','doctor']:
            Group.objects.get_or_create(name=n)
        self.stdout.write(self.style.SUCCESS('Groups ensured'))
