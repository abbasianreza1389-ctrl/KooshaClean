from django.db import models

class Payer(models.Model):
    name = models.CharField(max_length=120)
    def __str__(self): return self.name

class Policy(models.Model):
    payer = models.ForeignKey(Payer, on_delete=models.CASCADE)
    member_id = models.CharField(max_length=120)
    holder_name = models.CharField(max_length=120)
    active = models.BooleanField(default=True)

class Claim(models.Model):
    STATUS = [('draft','پیش‌نویس'),('submitted','ارسال'),('pending','درانتظار'),('paid','پرداخت'),('denied','رد')]
    policy = models.ForeignKey(Policy, on_delete=models.PROTECT)
    amount_minor = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=10, default='IRR')
    status = models.CharField(max_length=10, choices=STATUS, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

class ClaimLine(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='lines')
    code = models.CharField(max_length=40)
    qty = models.PositiveIntegerField(default=1)
    unit_price_minor = models.PositiveIntegerField(default=0)

class EOB(models.Model):
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='eob')
    raw = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
