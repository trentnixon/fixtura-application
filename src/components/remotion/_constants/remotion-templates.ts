import type { RemotionSandboxTemplateId } from "../_types/remotion-sandbox";

export const REMOTION_SANDBOX_TEMPLATE_IDS = [
  "Basic",
  "Brickwork",
  "Classic",
  "CNSW",
  "CNSWPrivate",
  "Sixers",
  "Thunder",
  "TwoColumnClassic",
  "Mudgeeraba",
  "BroadcastPro",
  "BroadcastProRounded",
] as const satisfies readonly RemotionSandboxTemplateId[];

export const DEFAULT_REMOTION_SANDBOX_TEMPLATE: RemotionSandboxTemplateId = "TwoColumnClassic";
