import type { AccountBrandingData } from "@/types/api/account";

export type BrandingScreenProps = {
  accountId: string;
};

export type BrandingScreenView =
  | { kind: "redirecting" }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "idle" }
  | { kind: "ready"; data: AccountBrandingData };
