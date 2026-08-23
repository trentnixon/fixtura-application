import { captureEvent } from "./analytics";

export function captureUserAction(action: string, properties?: Record<string, unknown>): void {
  captureEvent("user_action", { action, ...properties });
}

export function captureFormSubmitted(name: string, properties?: Record<string, unknown>): void {
  captureEvent("form_submitted", { name, ...properties });
}
