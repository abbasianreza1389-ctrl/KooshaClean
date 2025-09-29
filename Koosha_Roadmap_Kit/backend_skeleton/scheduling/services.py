from datetime import datetime, timedelta
from .models import ScheduleRule, ScheduleException
def slots_for(provider_name, date):
    rules = ScheduleRule.objects.filter(provider_name=provider_name, weekday=date.weekday())
    if ScheduleException.objects.filter(provider_name=provider_name, date=date, closed=True).exists(): return []
    out=[]; 
    for r in rules:
        t=datetime.combine(date, r.start_time); end=datetime.combine(date, r.end_time)
        while t<end:
            out.append({'start': t.isoformat(), 'end': (t+timedelta(minutes=r.slot_minutes)).isoformat()})
            t += timedelta(minutes=r.slot_minutes)
    return out
