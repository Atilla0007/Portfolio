from decimal import Decimal

from django.test import SimpleTestCase

from ..calculations import (
    CalculationError,
    calculate_purchasing_power,
    cumulative_inflation_percent,
    equivalent_end_year_amount,
    price_factor,
    same_nominal_amount_start_year_value,
    validate_amount,
)


class InflationCalculationTests(SimpleTestCase):
    def test_cpi_price_factor(self):
        self.assertEqual(price_factor("100", "150"), Decimal("1.5"))

    def test_inflation_formula(self):
        self.assertEqual(
            cumulative_inflation_percent("100", "150"),
            Decimal("50.0"),
        )
        self.assertEqual(
            equivalent_end_year_amount("100", "100", "150"),
            Decimal("150.0"),
        )
        self.assertEqual(
            same_nominal_amount_start_year_value("100", "100", "150"),
            Decimal("66.66666666666666666666666667"),
        )

    def test_deflation_is_negative_and_reduces_equivalent_amount(self):
        result = calculate_purchasing_power("100", "125", "100")

        self.assertEqual(result["cumulative_inflation_percent"], Decimal("-20.00"))
        self.assertEqual(result["equivalent_end_year_amount"], Decimal("80.00"))
        self.assertEqual(
            result["same_nominal_amount_start_year_value"],
            Decimal("125.00"),
        )

    def test_equal_cpi_values_preserve_amount(self):
        result = calculate_purchasing_power("100", "100", "100")

        self.assertEqual(result["cumulative_inflation_percent"], Decimal("0.00"))
        self.assertEqual(result["equivalent_end_year_amount"], Decimal("100.00"))
        self.assertEqual(
            result["same_nominal_amount_start_year_value"],
            Decimal("100.00"),
        )

    def test_zero_cpi_is_rejected(self):
        with self.assertRaisesMessage(
            CalculationError,
            "Start-year CPI must be greater than zero.",
        ):
            calculate_purchasing_power("100", "0", "100")

    def test_invalid_amounts_are_rejected(self):
        for value in (True, "NaN", "Infinity", "-1", "0", "1000000000000"):
            with self.subTest(value=value):
                with self.assertRaises(CalculationError):
                    validate_amount(value)
