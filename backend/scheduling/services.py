from datetime import datetime, timedelta, time as dtime
from django.utils import timezone
from .models import ScheduleRule, ScheduleException, CapacityWindow

def slots_for(provider_name: str, date):
    # Simplified: create slots by rules; ignore overlaps for brevity
    weekday = date.weekday()
    rules = ScheduleRule.objects.filter(provider_name=provider_name, weekday=weekday)
    exceptions = set(ScheduleException.objects.filter(provider_name=provider_name, date=date, closed=True).values_list('date', flat=True))
    if date in exceptions:
        return []
    out = []
    for r in rules:
        t = datetime.combine(date, r.start_time)
        end = datetime.combine(date, r.end_time)
        while t < end:
            out.append({'start': t.isoformat(), 'end': (t+timedelta(minutes=r.slot_minutes)).isoformat()})
            t += timedelta(minutes=r.slot_minutes)
    return out
