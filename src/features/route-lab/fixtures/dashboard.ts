export type LabDashboardSummary = {
  title: string;
  metric: string;
  detail: string;
};

export const LAB_DASHBOARD_POPULATED: LabDashboardSummary[] = [
  { title: "Active bundles", metric: "12", detail: "3 updated this week" },
  { title: "Templates", metric: "28", detail: "8 drafts" },
  { title: "Media items", metric: "1.2k", detail: "Last sync 2h ago" },
];

export const LAB_DASHBOARD_PARTIAL: LabDashboardSummary[] = [
  { title: "Active bundles", metric: "—", detail: "Could not load counts" },
  { title: "Templates", metric: "28", detail: "8 drafts" },
];
