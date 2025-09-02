import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Check if we're in a Node.js environment without importing node:process
  const isNodeJs =
    typeof process !== "undefined" && process.env && process.env["NEXT_RUNTIME"] === "nodejs";
  const isEdge =
    typeof process !== "undefined" && process.env && process.env["NEXT_RUNTIME"] === "edge";

  if (isNodeJs) {
    await import("../sentry.server.config");
  }

  if (isEdge) {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
