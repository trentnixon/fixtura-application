import type {
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  InvoiceRequestSummary,
} from "@/types/api/account";

export type BillingHistoryDebugExtra = Record<string, string | number | boolean | null | undefined>;

export type BillingHistoryReadyState = {
  kind: "ready";
  accountId: string;
  summary: AccountBillingSummaryV1 | null;
  invoiceRequests: InvoiceRequestSummary[];
  orders: AccountBillingOrderHistoryDto[];
  ordersLoadError: Error | null;
  invoiceWithdrawError: string | null;
  cancelInvoiceRequestPending: boolean;
  baseHref: string;
  withdrawInvoiceRequest: (request: InvoiceRequestSummary) => Promise<void>;
  refetchHistory: () => void;
  refetchOrders: () => void;
};

export type BillingHistoryState =
  | {
      kind: "invalid-account";
      accountId: string;
    }
  | {
      kind: "loading";
      accountId: string;
      summary: AccountBillingSummaryV1 | null;
      extra: BillingHistoryDebugExtra;
    }
  | {
      kind: "redirecting";
      accountId: string;
      summary: AccountBillingSummaryV1 | null;
      extra: BillingHistoryDebugExtra;
    }
  | {
      kind: "load-error";
      accountId: string;
      summary: AccountBillingSummaryV1 | null;
      message: string;
      extra: BillingHistoryDebugExtra;
      refetchHistory: () => void;
    }
  | BillingHistoryReadyState;
