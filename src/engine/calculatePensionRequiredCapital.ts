import type { PensionRequiredCapitalProjection, PlanSettings } from "@/types/finance";

const SPEND_DOWN_YEARS = 30;
const CALCULATION_SCALE = 12;

type Decimal = {
  coefficient: bigint;
  scale: number;
};

function powerOfTen(exponent: number) {
  return 10n ** BigInt(exponent);
}

function decimalFromNumber(value: number): Decimal {
  const [mantissa, exponentText] = value.toString().toLowerCase().split("e");
  const exponent = Number(exponentText ?? 0);
  const negative = mantissa.startsWith("-");
  const unsigned = mantissa.replace(/^[+-]/, "");
  const [whole, fraction = ""] = unsigned.split(".");
  let coefficient = BigInt(`${negative ? "-" : ""}${whole}${fraction}`);
  let scale = fraction.length - exponent;

  if (scale < 0) {
    coefficient *= powerOfTen(-scale);
    scale = 0;
  }

  return { coefficient, scale };
}

function add(left: Decimal, right: Decimal): Decimal {
  const scale = Math.max(left.scale, right.scale);
  return {
    coefficient: left.coefficient * powerOfTen(scale - left.scale)
      + right.coefficient * powerOfTen(scale - right.scale),
    scale,
  };
}

function subtract(left: Decimal, right: Decimal): Decimal {
  return add(left, { coefficient: -right.coefficient, scale: right.scale });
}

function multiply(left: Decimal, right: Decimal): Decimal {
  return {
    coefficient: left.coefficient * right.coefficient,
    scale: left.scale + right.scale,
  };
}

function compare(left: Decimal, right: Decimal) {
  const difference = subtract(left, right).coefficient;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

function halfUpQuotient(numerator: bigint, denominator: bigint) {
  const negative = numerator < 0n !== denominator < 0n;
  const absoluteNumerator = numerator < 0n ? -numerator : numerator;
  const absoluteDenominator = denominator < 0n ? -denominator : denominator;
  let quotient = absoluteNumerator / absoluteDenominator;
  const remainder = absoluteNumerator % absoluteDenominator;

  if (remainder * 2n >= absoluteDenominator) quotient += 1n;
  return negative ? -quotient : quotient;
}

function roundToScale(value: Decimal, scale: number): Decimal {
  if (value.scale <= scale) {
    return {
      coefficient: value.coefficient * powerOfTen(scale - value.scale),
      scale,
    };
  }

  return {
    coefficient: halfUpQuotient(value.coefficient, powerOfTen(value.scale - scale)),
    scale,
  };
}

function divideToScale(numerator: Decimal, denominator: Decimal, scale: number): Decimal {
  const scaleDifference = scale + denominator.scale - numerator.scale;
  const scaledNumerator = scaleDifference >= 0
    ? numerator.coefficient * powerOfTen(scaleDifference)
    : numerator.coefficient;
  const scaledDenominator = scaleDifference >= 0
    ? denominator.coefficient
    : denominator.coefficient * powerOfTen(-scaleDifference);

  return {
    coefficient: halfUpQuotient(scaledNumerator, scaledDenominator),
    scale,
  };
}

function decimalPower(value: Decimal, exponent: number): Decimal {
  let result = decimalFromNumber(1);
  for (let index = 0; index < exponent; index += 1) result = multiply(result, value);
  return result;
}

function moneyValue(value: Decimal) {
  const rounded = roundToScale(value, 2);
  return Number(rounded.coefficient) / 100;
}

// Mock-mode parity helper. Production pension projections come from the backend.
export function calculatePensionRequiredCapital(settings: PlanSettings): PensionRequiredCapitalProjection {
  const yearsToRetirement = Math.max(0, settings.retirementAge - settings.currentAge);
  const zero = decimalFromNumber(0);
  const one = decimalFromNumber(1);
  const inflationRate = roundToScale(decimalFromNumber(settings.inflation), CALCULATION_SCALE);
  const pensionReturnRate = roundToScale(decimalFromNumber(settings.pensionInvestmentReturn), CALCULATION_SCALE);
  const inflationGrowth = add(one, inflationRate);
  const pensionReturnGrowth = add(one, pensionReturnRate);
  const inflationFactor = decimalPower(inflationGrowth, yearsToRetirement);
  const statePension = settings.statePensionEnabled ? decimalFromNumber(settings.statePensionMonthly) : zero;
  const monthlyNeed = subtract(decimalFromNumber(settings.targetMonthlySpend), statePension);
  const annualNeed = compare(monthlyNeed, zero) > 0
    ? multiply(multiply(monthlyNeed, decimalFromNumber(12)), inflationFactor)
    : zero;
  const realReturn = subtract(
    decimalFromNumber(settings.pensionInvestmentReturn),
    decimalFromNumber(settings.inflation),
  );

  let preserveCapital: PensionRequiredCapitalProjection["preserveCapital"];
  if (compare(annualNeed, zero) === 0) {
    preserveCapital = {
      requiredCapitalAtRetirement: 0,
      requiredCapitalStatus: "calculated",
    };
  } else if (compare(realReturn, zero) <= 0) {
    preserveCapital = {
      requiredCapitalAtRetirement: null,
      requiredCapitalStatus: "non_positive_real_return",
    };
  } else {
    preserveCapital = {
      requiredCapitalAtRetirement: moneyValue(divideToScale(annualNeed, realReturn, 2)),
      requiredCapitalStatus: "calculated",
    };
  }

  let spendDownRequiredCapital = zero;
  for (let year = SPEND_DOWN_YEARS - 1; year >= 0; year -= 1) {
    const withdrawal = multiply(annualNeed, decimalPower(inflationGrowth, year));
    spendDownRequiredCapital = divideToScale(
      add(spendDownRequiredCapital, withdrawal),
      pensionReturnGrowth,
      CALCULATION_SCALE,
    );
  }

  return {
    preserveCapital,
    spendDown: {
      requiredCapitalAtRetirement: moneyValue(spendDownRequiredCapital),
    },
  };
}
