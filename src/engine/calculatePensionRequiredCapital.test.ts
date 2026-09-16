import { describe, expect, it } from "vitest";
import { calculatePensionRequiredCapital } from "@/engine/calculatePensionRequiredCapital";
import type { PlanSettings } from "@/types/finance";

const settings: PlanSettings = {
  startYear: 2026,
  birthYear: 1991,
  currentAge: 35,
  retirementAge: 60,
  pensionCalculationYears: 25,
  dashboardCalculationYears: 30,
  monthsInYear: 12,
  inflation: 0.04,
  investmentReturn: 0.08,
  pensionInvestmentReturn: 0.08,
  startingCapital: 1_000_000,
  targetMonthlySpend: 100_000,
  withdrawalStrategy: "spend_down_30y",
  statePensionEnabled: false,
  statePensionMonthly: 0,
};

describe("calculatePensionRequiredCapital", () => {
  it("raises both required-capital values when retirement spending increases", () => {
    const lower = calculatePensionRequiredCapital(settings);
    const higher = calculatePensionRequiredCapital({ ...settings, targetMonthlySpend: 150_000 });

    expect(higher.preserveCapital.requiredCapitalAtRetirement).toBeGreaterThan(
      lower.preserveCapital.requiredCapitalAtRetirement!,
    );
    expect(higher.spendDown.requiredCapitalAtRetirement).toBeGreaterThan(lower.spendDown.requiredCapitalAtRetirement);
  });

  it("lowers both required-capital values when pension return increases", () => {
    const lowerReturn = calculatePensionRequiredCapital(settings);
    const higherReturn = calculatePensionRequiredCapital({ ...settings, pensionInvestmentReturn: 0.1 });

    expect(higherReturn.preserveCapital.requiredCapitalAtRetirement).toBeLessThan(
      lowerReturn.preserveCapital.requiredCapitalAtRetirement!,
    );
    expect(higherReturn.spendDown.requiredCapitalAtRetirement).toBeLessThan(
      lowerReturn.spendDown.requiredCapitalAtRetirement,
    );
  });

  it("lowers both required-capital values when state pension is enabled", () => {
    const withoutPension = calculatePensionRequiredCapital(settings);
    const withPension = calculatePensionRequiredCapital({
      ...settings,
      statePensionEnabled: true,
      statePensionMonthly: 30_000,
    });

    expect(withPension.preserveCapital.requiredCapitalAtRetirement).toBeLessThan(
      withoutPension.preserveCapital.requiredCapitalAtRetirement!,
    );
    expect(withPension.spendDown.requiredCapitalAtRetirement).toBeLessThan(
      withoutPension.spendDown.requiredCapitalAtRetirement,
    );
  });

  it("returns a non-positive-real-return status when preservation has a positive need", () => {
    const projection = calculatePensionRequiredCapital({ ...settings, pensionInvestmentReturn: settings.inflation });

    expect(projection.preserveCapital).toEqual({
      requiredCapitalAtRetirement: null,
      requiredCapitalStatus: "non_positive_real_return",
    });
  });

  it("funds exactly 30 escalating annual withdrawals down to approximately zero", () => {
    const projection = calculatePensionRequiredCapital(settings);
    const yearsToRetirement = settings.retirementAge - settings.currentAge;
    const annualNeed = settings.targetMonthlySpend * 12 * (1 + settings.inflation) ** yearsToRetirement;
    let balance = projection.spendDown.requiredCapitalAtRetirement;

    for (let year = 0; year < 30; year += 1) {
      const withdrawal = annualNeed * (1 + settings.inflation) ** year;
      balance = balance * (1 + settings.pensionInvestmentReturn) - withdrawal;
    }

    expect(balance).toBeCloseTo(0, 1);
  });

  it("matches the backend scale-12 HALF_UP spend-down golden value", () => {
    // Backend vector: monthly need 137149.4465613, 0 years to retirement,
    // inflation 4%, return 8.000000000049%, no state pension. Backend rate
    // division rounds the decimal return to 0.080000000000 at scale 12.
    const projection = calculatePensionRequiredCapital({
      ...settings,
      currentAge: 40,
      retirementAge: 40,
      targetMonthlySpend: 137_149.4465613,
      inflation: 0.04,
      pensionInvestmentReturn: 0.08000000000049,
      statePensionEnabled: false,
      statePensionMonthly: 0,
    });

    expect(projection.spendDown.requiredCapitalAtRetirement).toBe(27_883_023.15);
  });
});
