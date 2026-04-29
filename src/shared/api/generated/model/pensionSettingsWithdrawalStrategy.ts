
/**
 * UI scenarios: preserve / spend
 */
export type PensionSettingsWithdrawalStrategy = typeof PensionSettingsWithdrawalStrategy[keyof typeof PensionSettingsWithdrawalStrategy];


export const PensionSettingsWithdrawalStrategy = {
  preserve_capital: 'preserve_capital',
  spend_down_30y: 'spend_down_30y',
} as const;
