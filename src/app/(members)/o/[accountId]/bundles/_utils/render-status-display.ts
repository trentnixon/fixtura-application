import type { AccountRenderListStatus } from "@/types/api/account";

export type RenderStatusDisplay = {
  label: string;
  pillClassName: string;
};

/** Kitchen-sink `StatusPill` styling for Phase 7 `status` values. */
export function renderStatusDisplay(status: AccountRenderListStatus): RenderStatusDisplay {
  switch (status) {
    case "complete":
      return {
        label: "Complete",
        pillClassName: "bg-success/5 text-success border-success/10",
      };
    case "processing":
      return {
        label: "Processing",
        pillClassName: "bg-primary/5 text-primary border-primary/10",
      };
    case "pending":
      return {
        label: "Pending",
        pillClassName: "bg-muted text-muted-foreground border-border",
      };
  }
}
