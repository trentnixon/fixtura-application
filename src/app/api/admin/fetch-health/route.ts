import { NextResponse } from "next/server";

import { appRoutes } from "@/lib/api/routes/route-definitions";

import type { EndpointHealthResult, FetchHealthResponse } from "@/lib/api/services/health.api";
// I'll fix the type locations later or just use them from service for now.

export async function GET() {
  const results: EndpointHealthResult[] = [];

  // For a basic implementation, we just report the registry status.
  // In a real health check, we might actually ping some endpoints.

  const domains = Object.keys(appRoutes) as Array<keyof typeof appRoutes>;

  for (const domain of domains) {
    const routes = appRoutes[domain];
    for (const routeKey of Object.keys(routes)) {
      const route = (routes as any)[routeKey];

      results.push({
        key: route.key,
        path: route.path,
        method: route.method,
        status: route.status === "ready" ? "ok" : "skipped",
        message: `Implementation status: ${route.status}`,
      });
    }
  }

  const response: FetchHealthResponse = {
    service: "fetch-client",
    overallStatus: results.some((r) => r.status === "error") ? "error" : "ok",
    checkedAt: new Date().toISOString(),
    results,
  };

  return NextResponse.json(response);
}
