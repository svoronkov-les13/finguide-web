import { z } from "zod";

export const settingsSchema = z.object({
  startYear: z.coerce.number().int().min(2020).max(2100),
  birthYear: z.coerce.number().int().min(1900).max(2100),
  monthsInYear: z.coerce.number().int().min(1).max(12),
  retirementAge: z.coerce.number().int().min(35).max(90),
  inflationPercent: z.coerce.number().min(0).max(30),
  investmentReturnPercent: z.coerce.number().min(-20).max(50),
  startingCapital: z.coerce.number().min(0),
  targetMonthlySpend: z.coerce.number().min(0),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const whatIfSchema = z.object({
  investmentReturnPercent: z.coerce.number().min(-20).max(50),
  inflationPercent: z.coerce.number().min(0).max(30),
  retirementAge: z.coerce.number().int().min(35).max(90),
});

export type WhatIfFormValues = z.infer<typeof whatIfSchema>;
