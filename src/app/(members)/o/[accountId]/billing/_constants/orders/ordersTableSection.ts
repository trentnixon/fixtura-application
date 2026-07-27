export const ordersTableSectionCopy = {
  cardTitle: "Orders",
  cardDescription: "Current and previous annual billing orders.",
  errorTitle: "Could not load orders",
  emptyState: "No orders available yet.",
  missingName: "–",
  planColumn: "Plan",
  actionsColumn: "Actions",
  /** Hosted invoice while awaiting payment. */
  payInvoice: "Pay invoice",
  /** Hosted invoice as document (paid / cancelled / non-payable). */
  viewHostedInvoice: "View invoice",
  downloadInvoicePdf: "Download invoice",
  startedColumn: "Started",
  endedColumn: "Ended",
  daysColumn: "Days",
  activeColumn: "Active",
  activeYes: "Yes",
  activeNo: "No",
  statusColumn: "Status",
  totalColumn: "Total",
} as const;

/** Min width (px) so the table scrolls horizontally on narrow viewports. */
export const ORDERS_TABLE_SECTION_MIN_WIDTH_PX = 960;
