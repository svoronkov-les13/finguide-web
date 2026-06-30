import { z } from "zod";

export const settingsSchema = z.object({
  startYear: z.coerce.number().int().min(2020).max(2100),
  birthYear: z.coerce.number().int().min(1900).max(2100),
  monthsInYear: z.coerce.number().int().min(1).max(12),
  retirementAge: z.coerce.number().int().min(35).max(90),
  pensionCalculationYears: z.coerce.number().int().min(1).max(80),
  dashboardCalculationYears: z.coerce.number().int().min(1).max(80),
  inflationPercent: z.coerce.number().min(0).max(30),
  investmentReturnPercent: z.coerce.number().min(-20).max(50),
  startingCapital: z.coerce.number().min(0),
  targetMonthlySpend: z.coerce.number().min(0),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const whatIfSchema = z.object({
  incomeChangePercent: z.coerce.number().min(-50).max(100),
  expenseChangePercent: z.coerce.number().min(-50).max(100),
  returnDeltaPercent: z.coerce.number().min(-5).max(10),
  inflationDeltaPercent: z.coerce.number().min(-5).max(10),
  retirementAgeShift: z.coerce.number().int().min(-10).max(10),
  goalsCostChangePercent: z.coerce.number().min(-30).max(100),
});

export type WhatIfFormValues = z.infer<typeof whatIfSchema>;
