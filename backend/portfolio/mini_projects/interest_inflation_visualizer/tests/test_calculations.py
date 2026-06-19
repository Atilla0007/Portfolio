from decimal import Decimal

from django.test import SimpleTestCase

from ..calculations import (
    CalculationError,
    calculate_growth,
    compound_interest,
    effective_annual_rate,
    exact_real_annual_return,
    real_value,
    simple_interest,
)


class InterestCalculationTests(SimpleTestCase):
    principal = Decimal("1000")
    rate = Decimal("0.08")

    def test_simple_interest(self):
        self.assertEqual(simple_interest(self.principal, self.rate, 10), Decimal("1800.00"))

    def test_annual_compound_interest(self):
        self.assertEqual(
            compound_interest(self.principal, self.rate, 10, 1),
            Decimal("2158.92499727278669824000"),
        )

    def test_supported_compounding_frequencies(self):
        results = [
            compound_interest(self.principal, self.rate, 10, frequency)
            for frequency in (1, 2, 4, 12, 365)
        ]
        self.assertEqual(results, sorted(results))

    def test_zero_interest_keeps_growth_paths_equal_to_principal(self):
        result = calculate_growth("1000", "0", 4, 12, "5")
        self.assertEqual(result["summary"]["simple_nominal"], self.principal)
        self.assertEqual(result["summary"]["compound_nominal"], self.principal)

    def test_zero_inflation_keeps_nominal_and_real_equal(self):
        result = calculate_growth("1000", "8", 5, 4, "0")
        self.assertEqual(result["summary"]["compound_nominal"], result["summary"]["compound_real"])

    def test_controlled_deflation_increases_cash_real_value(self):
        result = calculate_growth("1000", "0", 2, 1, "-10")
        self.assertGreater(result["summary"]["cash_real"], self.principal)

    def test_real_value_formula(self):
        self.assertEqual(
            real_value(Decimal("110"), Decimal("0.10"), 1),
            Decimal("100"),
        )

    def test_effective_annual_rate(self):
        self.assertEqual(
            effective_annual_rate(Decimal("0.12"), 12),
            Decimal("0.126825030131969720661201"),
        )

    def test_exact_real_annual_return(self):
        self.assertEqual(
            exact_real_annual_return(Decimal("0.08"), Decimal("0.05")),
            Decimal("0.028571428571428571428571429"),
        )

    def test_series_contains_year_zero_through_final_year(self):
        result = calculate_growth("1000", "8", 10, 1, "5")
        self.assertEqual([item["year"] for item in result["series"]], list(range(11)))

    def test_compound_minus_simple_uses_unrounded_values(self):
        result = calculate_growth("1000", "8", 10, 1, "5")
        self.assertEqual(
            result["summary"]["compound_minus_simple"],
            result["summary"]["compound_nominal"] - result["summary"]["simple_nominal"],
        )

    def test_decimal_precision_does_not_use_binary_float(self):
        result = calculate_growth("0.10", "0.1", 3, 12, "0.1")
        self.assertIsInstance(result["summary"]["compound_real"], Decimal)
        self.assertNotIn("00000000000000004", str(result["summary"]["compound_real"]))

    def test_invalid_inputs_are_rejected_by_pure_functions(self):
        invalid_cases = (
            ("0", "8", 10, 1, "5"),
            ("1000000001", "8", 10, 1, "5"),
            ("1000", "-1", 10, 1, "5"),
            ("1000", "101", 10, 1, "5"),
            ("1000", "8", 0, 1, "5"),
            ("1000", "8", 101, 1, "5"),
            ("1000", "8", 10, 3, "5"),
            ("1000", "8", 10, 1, "-21"),
            ("1000", "8", 10, 1, "101"),
            ("NaN", "8", 10, 1, "5"),
            ("Infinity", "8", 10, 1, "5"),
        )
        for values in invalid_cases:
            with self.subTest(values=values), self.assertRaises(CalculationError):
                calculate_growth(*values)
