from decimal import Decimal
def compute_shares(base_tariff: Decimal, patient_share: Decimal, discount: Decimal = Decimal('0')):
    patient = max(Decimal('0'), patient_share - discount)
    insurer = max(Decimal('0'), base_tariff - patient)
    return {'patient': patient, 'insurer': insurer}
