import type {
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  InvoiceRequestSummary,
} from "@/types/api/account";

export type BillingHistoryReadyState = {
  kind: "ready";
  accountId: string;
  summary: AccountBillingSummaryV1;
  invoiceRequests: InvoiceRequestSummary[];
  orders: AccountBillingOrderHistoryDto[];
  ordersLoadError: Error | null;
  isSupportView: boolean;
  baseHref: string;
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
    }
  | {
      kind: "redirecting";
      accountId: string;
    }
  | {
      kind: "load-error";
      accountId: string;
      message: string;
      refetchHistory: () => void;
    }
  | BillingHistoryReadyState;
