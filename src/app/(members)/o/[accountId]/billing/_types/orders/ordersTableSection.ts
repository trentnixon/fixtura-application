import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export type OrdersTableSectionProps = {
  orders: AccountBillingOrderHistoryDto[];
  activeOrder: AccountBillingOrderDto | null;
  loadError: Error | null;
  onRetry: () => void;
};

export type OrdersTableProps = {
  orders: AccountBillingOrderHistoryDto[];
  activeOrder: AccountBillingOrderDto | null;
};

export type OrdersTableRowProps = {
  order: AccountBillingOrderHistoryDto;
  activeOrder: AccountBillingOrderDto | null;
};

export type OrdersTableInvoiceActionsProps = {
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
};
