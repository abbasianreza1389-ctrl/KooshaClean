# core/tasks.py
import subprocess, shlex
from celery import shared_task
from .models import Attachment

@shared_task
def make_video_thumb(attach_id:int):
    a = Attachment.objects.get(id=attach_id)
    if a.kind!="video": return
    # ffmpeg -ss 00:00:01 -i input -frames:v 1 -vf scale=420:-1 thumb.jpg
    cmd = f'ffmpeg -ss 1 -i "{a.file.path}" -frames:v 1 -vf scale=420:-1 "{a.file.path}.jpg" -y'
    subprocess.run(shlex.split(cmd), check=False)
