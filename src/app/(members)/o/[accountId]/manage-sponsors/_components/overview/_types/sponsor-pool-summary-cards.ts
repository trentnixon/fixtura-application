export type SponsorPoolSummaryStats = {
  total: number;
  placed: number;
  unassigned: number;
  archived: number;
};

export type SponsorPoolSummaryCardsProps = {
  stats: SponsorPoolSummaryStats;
};

export type SponsorPoolSummaryMetricDefinition = {
  label: string;
  statKey: keyof SponsorPoolSummaryStats;
};

export type SponsorPoolSummaryMetricProps = {
  label: string;
  value: number;
};
