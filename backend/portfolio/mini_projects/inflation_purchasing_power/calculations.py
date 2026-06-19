from decimal import Decimal, InvalidOperation, ROUND_HALF_UP


MONEY_PLACES = Decimal("0.01")
PERCENT_PLACES = Decimal("0.01")
CPI_PLACES = Decimal("0.0001")
MAX_AMOUNT = Decimal("999999999999.99")


class CalculationError(ValueError):
    pass


def to_decimal(value, label):
    if isinstance(value, bool):
        raise CalculationError(f"{label} must be a finite number.")

    try:
        number = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise CalculationError(f"{label} must be a finite number.") from exc

    if not number.is_finite():
        raise CalculationError(f"{label} must be a finite number.")
    return number


def validate_amount(value):
    amount = to_decimal(value, "Amount")
    if amount <= 0:
        raise CalculationError("Amount must be greater than zero.")
    if amount > MAX_AMOUNT:
        raise CalculationError("Amount is larger than the supported limit.")
    return amount


def validate_cpi(value, label="CPI"):
    cpi = to_decimal(value, label)
    if cpi <= 0:
        raise CalculationError(f"{label} must be greater than zero.")
    return cpi


def price_factor(start_cpi, end_cpi):
    start = validate_cpi(start_cpi, "Start-year CPI")
    end = validate_cpi(end_cpi, "End-year CPI")
    return end / start


def cumulative_inflation_percent(start_cpi, end_cpi):
    return (price_factor(start_cpi, end_cpi) - Decimal("1")) * Decimal("100")


def equivalent_end_year_amount(amount, start_cpi, end_cpi):
    return validate_amount(amount) * price_factor(start_cpi, end_cpi)


def same_nominal_amount_start_year_value(amount, start_cpi, end_cpi):
    validated_amount = validate_amount(amount)
    factor = price_factor(start_cpi, end_cpi)
    return validated_amount / factor


def calculate_purchasing_power(amount, start_cpi, end_cpi):
    validated_amount = validate_amount(amount)
    start = validate_cpi(start_cpi, "Start-year CPI")
    end = validate_cpi(end_cpi, "End-year CPI")
    factor = end / start

    return {
        "amount": validated_amount.quantize(MONEY_PLACES, rounding=ROUND_HALF_UP),
        "start_cpi": start.quantize(CPI_PLACES, rounding=ROUND_HALF_UP),
        "end_cpi": end.quantize(CPI_PLACES, rounding=ROUND_HALF_UP),
        "price_factor": factor,
        "cumulative_inflation_percent": (
            (factor - Decimal("1")) * Decimal("100")
        ).quantize(PERCENT_PLACES, rounding=ROUND_HALF_UP),
        "equivalent_end_year_amount": (
            validated_amount * factor
        ).quantize(MONEY_PLACES, rounding=ROUND_HALF_UP),
        "same_nominal_amount_start_year_value": (
            validated_amount / factor
        ).quantize(MONEY_PLACES, rounding=ROUND_HALF_UP),
    }
