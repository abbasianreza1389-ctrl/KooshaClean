from decimal import Decimal
def can_book(balance: Decimal, credit_limit: Decimal) -> bool:
    return (balance + credit_limit) >= 0
