// This file configures the initialization of PostHog on the client.
// Next.js will automatically import this file for instrumentation.
// https://posthog.com/docs/integrate/client/js

import process from "node:process";
import posthog from "posthog-js";

posthog.init(process.env["NEXT_PUBLIC_POSTHOG_KEY"]!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: process.env["NODE_ENV"] === "development",
});
