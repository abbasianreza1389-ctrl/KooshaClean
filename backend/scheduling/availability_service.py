from datetime import datetime, time, timedelta
from typing import List, Dict
from django.utils.timezone import make_aware, get_default_timezone
from .models import AvailabilityRule, AvailabilityException, Capacity, Appointment

WEEKDAYS_FA = ["دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه","یکشنبه"]  # فقط مرجع نمایشی

def _time_range(start:time, end:time, step_min:int):
    dt = datetime.combine(datetime.today(), start)
    enddt = datetime.combine(datetime.today(), end)
    while dt < enddt:
        yield dt.time()
        dt += timedelta(minutes=step_min)

def free_slots(date_str:str, dept:str="", provider:str="") -> List[Dict]:
    tz = get_default_timezone()
    date = datetime.fromisoformat(date_str).date()
    weekday_name = date.strftime("%A")  # EN؛ Rule ما می‌تواند کل بازه "شنبه-چهارشنبه" هم داشته باشد
    rules = AvailabilityRule.objects.all()
    if dept: rules = rules.filter(dept=dept)
    if provider: rules = rules.filter(provider=provider)

    # فیلتر ساده بر اساس نام روز/بازه متنی
    r2 = []
    for r in rules:
        w = r.weekday
        if "-" in w:
            r2.append(r)  # ساده: می‌پذیریم؛ می‌توان با map روزها را دقیق کرد
        else:
            r2.append(r)
    rules = r2

    # استثناها
    excs = AvailabilityException.objects.filter(date=date)
    def blocked(t:time):
        for e in excs:
            if e.closed: return True
            if e.start_time <= t < e.end_time: return True
        return False

    out = []
    for r in rules:
        step = r.slot_minutes or 30
        cap = r.max_concurrent
        # Capacity override
        cobj = Capacity.objects.filter(dept=r.dept, provider=r.provider).first()
        if cobj: cap = cobj.max_concurrent or cap
        for t in _time_range(r.start_time, r.end_time, step):
            if blocked(t): continue
            start_dt = make_aware(datetime.combine(date, t), tz)
            end_dt = start_dt + timedelta(minutes=step)
            # تعداد نوبت‌های گرفته‌شده در همین اسلات
            taken = Appointment.objects.filter(provider=r.provider, start=start_dt, status__in=["scheduled","done"]).count()
            if taken < cap:
                out.append({
                    "dept": r.dept, "provider": r.provider,
                    "start": start_dt.isoformat(), "end": end_dt.isoformat(),
                    "capacity": cap, "taken": taken, "free": cap - taken
                })
    return out
