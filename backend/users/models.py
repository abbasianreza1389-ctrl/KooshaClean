from django.contrib.auth.models import Group

ROLES = [
  ('admin','مدیر'),('clerk','منشی'),('therapist','درمانگر'),('finance','مالی'),('patient','بیمار')
]
def ensure_roles():
    for codename, _ in ROLES:
        Group.objects.get_or_create(name=codename)
