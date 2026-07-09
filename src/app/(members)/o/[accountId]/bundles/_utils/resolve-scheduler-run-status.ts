import type { AccountSchedulerDocument } from "@/types/api/account";

export type SchedulerRunStatus = {
  label: string;
  description: string;
  tone: "neutral" | "active";
};

export function resolveSchedulerRunStatus(
  scheduler: Pick<AccountSchedulerDocument, "Queued" | "isRendering">,
): SchedulerRunStatus {
  if (scheduler.isRendering) {
    return {
      label: "Rendering",
      description: "Your weekly bundle is being generated right now.",
      tone: "active",
    };
  }

  if (scheduler.Queued) {
    return {
      label: "Queued",
      description: "A bundle run is queued and will start soon.",
      tone: "active",
    };
  }

  return {
    label: "Idle",
    description: "",
    tone: "neutral",
  };
}
