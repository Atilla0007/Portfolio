from decimal import Decimal, InvalidOperation, localcontext


MAX_PRINCIPAL = Decimal("1000000000")
MAX_YEARS = 100
MIN_INTEREST_PERCENT = Decimal("0")
MAX_INTEREST_PERCENT = Decimal("100")
MIN_INFLATION_PERCENT = Decimal("-20")
MAX_INFLATION_PERCENT = Decimal("100")
SUPPORTED_COMPOUNDING = (1, 2, 4, 12, 365)
ONE_HUNDRED = Decimal("100")


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


def validate_inputs(
    principal,
    annual_interest_rate,
    years,
    compounds_per_year,
    annual_inflation_rate,
):
    amount = to_decimal(principal, "Principal")
    interest = to_decimal(annual_interest_rate, "Annual interest rate")
    inflation = to_decimal(annual_inflation_rate, "Annual inflation rate")

    if amount <= 0 or amount > MAX_PRINCIPAL:
        raise CalculationError("Principal is outside the supported range.")
    if isinstance(years, bool) or not isinstance(years, int) or not 1 <= years <= MAX_YEARS:
        raise CalculationError("Years must be an integer from 1 to 100.")
    if isinstance(compounds_per_year, bool) or compounds_per_year not in SUPPORTED_COMPOUNDING:
        raise CalculationError("Compounding frequency is not supported.")
    if not MIN_INTEREST_PERCENT <= interest <= MAX_INTEREST_PERCENT:
        raise CalculationError("Annual interest rate must be from 0% to 100%.")
    if not MIN_INFLATION_PERCENT <= inflation <= MAX_INFLATION_PERCENT:
        raise CalculationError("Annual inflation rate must be from -20% to 100%.")

    return amount, interest / ONE_HUNDRED, inflation / ONE_HUNDRED


def simple_interest(principal, annual_rate, years):
    return principal * (Decimal("1") + annual_rate * years)


def compound_interest(principal, annual_rate, years, compounds_per_year):
    periods = compounds_per_year * years
    return principal * (
        Decimal("1") + annual_rate / compounds_per_year
    ) ** periods


def inflation_factor(annual_inflation_rate, years):
    return (Decimal("1") + annual_inflation_rate) ** years


def real_value(nominal_value, annual_inflation_rate, years):
    return nominal_value / inflation_factor(annual_inflation_rate, years)


def effective_annual_rate(annual_rate, compounds_per_year):
    return (
        Decimal("1") + annual_rate / compounds_per_year
    ) ** compounds_per_year - Decimal("1")


def exact_real_annual_return(effective_rate, annual_inflation_rate):
    return (
        (Decimal("1") + effective_rate)
        / (Decimal("1") + annual_inflation_rate)
    ) - Decimal("1")


def calculate_growth(
    principal,
    annual_interest_rate,
    years,
    compounds_per_year,
    annual_inflation_rate,
):
    amount, interest_rate, inflation_rate = validate_inputs(
        principal,
        annual_interest_rate,
        years,
        compounds_per_year,
        annual_inflation_rate,
    )

    with localcontext() as context:
        context.prec = 50
        series = []
        for year in range(years + 1):
            cash_nominal = amount
            simple_nominal = simple_interest(amount, interest_rate, year)
            compound_nominal = compound_interest(
                amount,
                interest_rate,
                year,
                compounds_per_year,
            )
            price_factor = inflation_factor(inflation_rate, year)
            series.append(
                {
                    "year": year,
                    "cash_nominal": cash_nominal,
                    "cash_real": cash_nominal / price_factor,
                    "simple_nominal": simple_nominal,
                    "simple_real": simple_nominal / price_factor,
                    "compound_nominal": compound_nominal,
                    "compound_real": compound_nominal / price_factor,
                }
            )

        final = series[-1]
        final_inflation_factor = inflation_factor(inflation_rate, years)
        ear = effective_annual_rate(interest_rate, compounds_per_year)
        real_return = exact_real_annual_return(ear, inflation_rate)

    warnings = [
        "Results are educational estimates under fixed assumptions, not financial advice."
    ]
    if real_return < 0:
        warnings.append(
            "Under these assumptions, compound growth does not preserve real purchasing power each year."
        )

    return {
        "inputs": {
            "principal": amount,
            "annual_interest_rate": interest_rate * ONE_HUNDRED,
            "years": years,
            "compounds_per_year": compounds_per_year,
            "annual_inflation_rate": inflation_rate * ONE_HUNDRED,
        },
        "summary": {
            **{key: final[key] for key in final if key != "year"},
            "compound_minus_simple": (
                final["compound_nominal"] - final["simple_nominal"]
            ),
            "cumulative_inflation_percent": (
                final_inflation_factor - Decimal("1")
            ) * ONE_HUNDRED,
            "effective_annual_interest_rate": ear * ONE_HUNDRED,
            "exact_real_annual_return": real_return * ONE_HUNDRED,
        },
        "series": series,
        "formulas": [
            "A_simple = P x (1 + r x t)",
            "A_compound = P x (1 + r / n)^(n x t)",
            "Inflation_factor = (1 + i)^t",
            "Real_value = Nominal_value / Inflation_factor",
            "EAR = (1 + r / n)^n - 1",
            "Real_rate = ((1 + EAR) / (1 + i)) - 1",
        ],
        "warnings": warnings,
    }
