import type { AccountRenderDetail } from "@/types/api/account";

export type BundlesScreenProps = {
  accountId: string;
};

export type BundlesScreenView =
  | { kind: "redirecting" }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "idle" }
  | { kind: "ready" };

export type BundlesRenderDetailScreenProps = {
  accountId: string;
  renderId: string;
};

export type BundlesRenderDetailScreenView =
  | { kind: "redirecting" }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "idle" }
  | { kind: "invalidRenderId" }
  | { kind: "renderNotFound" }
  | { kind: "ready"; render: AccountRenderDetail };
