export type ActiveTrialStatusCardViewModel = {
  daysRemaining: number | null;
  remainingPercent: number | null;
  tierLabel: string | null;
};

export type PaidActiveStatusCardViewModel = {
  daysRemaining: number | null;
  endAt: string | null;
  hasPeriodBounds: boolean;
  remainingPercent: number | null;
  startAt: string | null;
  tierLabel: string | null;
};
