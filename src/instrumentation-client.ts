import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cdf9028ff8e7f4ec22dbbd1df112f328@o4507144238202880.ingest.de.sentry.io/4509941689417808",

  // Keep client-side tracing disabled unless product telemetry is intentionally enabled.
  tracesSampleRate: 0,

  enableLogs: true,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
