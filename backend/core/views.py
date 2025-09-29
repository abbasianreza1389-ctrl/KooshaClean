from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Attachment
from .serializers import AttachmentSer

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        p  = self.request.query_params
        if p.get("patient"):       qs = qs.filter(patient_id=p["patient"])
        if p.get("appointment"):   qs = qs.filter(appointment_id=p["appointment"])
        if p.get("billing_entry"): qs = qs.filter(billing_entry_id=p["billing_entry"])
        if p.get("referral"):      qs = qs.filter(referral_id=p["referral"])
        if p.get("public") == "1": qs = qs.filter(public=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
