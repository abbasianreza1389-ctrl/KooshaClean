from django.db import models

class TimeStamped(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Service(TimeStamped):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    desc = models.TextField(blank=True)
    price = models.PositiveIntegerField(default=0)  # ریال
    def __str__(self): return self.title

class Doctor(TimeStamped):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True)
    bio  = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    def __str__(self): return self.name

class Post(TimeStamped):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    excerpt = models.TextField(blank=True)
    body = models.TextField(blank=True)
    date = models.DateField()
    def __str__(self): return self.title

class Patient(TimeStamped):
    first_name = models.CharField(max_length=120)
    last_name  = models.CharField(max_length=120)
    mobile = models.CharField(max_length=20, db_index=True)
    national_id = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    def __str__(self): return f"{self.first_name} {self.last_name}"

class Appointment(TimeStamped):
    STATUS = [("new","جدید"),("confirmed","تایید"),("done","انجام"),("cancel","لغو")]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor  = models.ForeignKey(Doctor,  on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    date_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=45)
    status = models.CharField(max_length=12, choices=STATUS, default="new")
    def __str__(self): return f"{self.patient} @ {self.date_time:%Y-%m-%d %H:%M}"

class BillingEntry(TimeStamped):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="billing")
    total_amount = models.PositiveIntegerField(default=0)
    base_insurance = models.PositiveIntegerField(default=0)
    complementary_ins = models.PositiveIntegerField(default=0)
    patient_paid = models.PositiveIntegerField(default=0)
    def __str__(self): return f"صورت‌حساب #{self.id}"
import mimetypes, os
from datetime import datetime
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from PIL import Image

def upload_path(instance, filename):
    d = datetime.now()
    name, ext = os.path.splitext(filename)
    return f"uploads/{d:%Y/%m/%d}/{instance.kind}/{d:%H%M%S}_{name}{ext}"

class Attachment(models.Model):
    KIND_CHOICES = [("image","عکس"),("video","ویدئو"),("doc","سند")]
    kind  = models.CharField(max_length=8, choices=KIND_CHOICES)
    file  = models.FileField(upload_to=upload_path)
    thumb = models.ImageField(upload_to="uploads/thumbs/", null=True, blank=True)
    title = models.CharField(max_length=200, blank=True)
    size  = models.PositiveBigIntegerField(default=0)
    mime  = models.CharField(max_length=100, blank=True)
    public = models.BooleanField(default=False)  # اگر مدرک عمومی است

    # اتصال ژنریک به هر آبجکت (مثلاً Patient/Appointment/…)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    created = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # متادیتا
        if self.file and not self.size:
            self.size = self.file.size
        if self.file and not self.mime:
            self.mime = mimetypes.guess_type(self.file.name)[0] or ""

        super().save(*args, **kwargs)

        # ساخت thumbnail برای تصویرها
        if self.kind == "image" and self.file and not self.thumb:
            try:
                img = Image.open(self.file.path)
                img.thumbnail((420, 420))
                base, _ = os.path.splitext(os.path.basename(self.file.name))
                thumb_name = f"uploads/thumbs/{base}_thumb.jpg"
                thumb_path = os.path.join(os.path.dirname(self.file.storage.path(self.file.name)), "../../", thumb_name).replace("\\","/")
                os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
                img.convert("RGB").save(thumb_path, "JPEG", quality=85)
                # ذخیره در فیلد
                self.thumb.name = thumb_name
                super().save(update_fields=["thumb"])
            except Exception:
                pass

    def __str__(self): return self.title or os.path.basename(self.file.name)
