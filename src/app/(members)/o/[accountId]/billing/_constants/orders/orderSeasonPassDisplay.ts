export const ORDER_SEASON_PASS_ENDING_SOON_MAX_DAYS = 7;

export const ORDER_PAID_AWAITING_START_COPY = {
  title: "Order ready",
  cardDescription: "Your Season Pass is paid and will start on the date below.",
  cardDescriptionPrefix: "Your Season Pass is paid and starts in ",
  cardDescriptionSuffix: ".",
  statusPrefix: "Order ready — starting in ",
  statusSuffix: ".",
  badgeLabel: "Starting soon",
  periodStartsLabel: "Season Pass starts",
  periodEndsLabel: "Renews on",
  processingNotYetActiveBadge: "Not yet active",
} as const;

export const ORDER_ACCOUNT_EXPIRING_SOON_COPY = {
  title: "Season Pass ending soon",
  bodyPrefix: "Your account will expire in ",
  bodySuffix: ".",
} as const;
