export type SponsorPlacementMetric = {
  label: string;
  value: number;
  suffix?: string | undefined;
};

export type SponsorPlacementMetricGroupProps = {
  title: string;
  metrics: SponsorPlacementMetric[];
};
