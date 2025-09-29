from rest_framework import serializers
from .models import Payer, Policy, Claim, ClaimLine, EOB

class PayerSer(serializers.ModelSerializer):
    class Meta: model=Payer; fields='__all__'
class PolicySer(serializers.ModelSerializer):
    class Meta: model=Policy; fields='__all__'
class ClaimLineSer(serializers.ModelSerializer):
    class Meta: model=ClaimLine; fields='__all__'
class ClaimSer(serializers.ModelSerializer):
    lines = ClaimLineSer(many=True, required=False)
    class Meta: model=Claim; fields=['id','policy','amount_minor','currency','status','created_at','lines']
    def create(self, validated):
        lines = validated.pop('lines',[])
        c = Claim.objects.create(**validated)
        for ln in lines:
            ClaimLine.objects.create(claim=c, **ln)
        return c
class EOBSer(serializers.ModelSerializer):
    class Meta: model=EOB; fields='__all__'
