"use client";

import {
  IconDatabase,
  IconLoader2,
  IconRefresh,
  IconRoute,
  IconSearch,
  IconServer,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api/client/fetch-client";
import { queryKeys } from "@/lib/api/query/query-keys";
import { appRoutes } from "@/lib/api/routes/route-definitions";
import { accountApi } from "@/lib/api/services/account.api";
import { authApi } from "@/lib/api/services/auth.api";
import { healthApi } from "@/lib/api/services/health.api";
import { cn } from "@/lib/utils";

/**
 * Helper to flatten appRoutes for easier listing.
 */
function flattenRoutes() {
  const flattened: any[] = [];
  Object.entries(appRoutes).forEach(([domain, routes]) => {
    Object.entries(routes).forEach(([, definition]) => {
      flattened.push({
        ...definition,
        domainName: domain,
      });
    });
  });
  return flattened;
}

/**
 * Mapping of route keys to their corresponding TanStack Query keys.
 */
const routeToQueryKeyMap: Record<string, any> = {
  "auth.me": queryKeys.auth.me,
  "auth.session": queryKeys.auth.session,
  "account.me": queryKeys.account.me,
  "admin.fetch-health": queryKeys.admin.fetchHealth,
};

/**
 * Mapping of route keys to their fetch functions.
 */
const routeToFetchFnMap: Record<string, () => Promise<any>> = {
  "auth.me": () => authApi.getCurrentUser(),
  "account.me": () => accountApi.getAccountMe(),
  "admin.fetch-health": () => healthApi.getFetchHealth(),
};

export default function AdminSystemPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const routes = useMemo(() => flattenRoutes(), []);

  const filteredRoutes = routes.filter(
    (r) =>
      r.key.toLowerCase().includes(search.toLowerCase()) ||
      r.path.toLowerCase().includes(search.toLowerCase()) ||
      r.domainName.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedRoute = routes.find((r) => r.key === selectedKey);
  const mappedQueryKey = selectedKey ? routeToQueryKeyMap[selectedKey] : null;

  // Get data from cache if it exists
  const cacheData = mappedQueryKey ? queryClient.getQueryData(mappedQueryKey) : null;
  const cacheState = mappedQueryKey ? queryClient.getQueryState(mappedQueryKey) : null;

  const handleFetch = async () => {
    if (!selectedRoute) return;

    setIsFetching(true);
    try {
      const fetchFn =
        routeToFetchFnMap[selectedRoute.key] || (() => apiClient.get(selectedRoute.path));

      if (mappedQueryKey) {
        // If we have a query key, use TanStack Query's fetch to update cache
        await queryClient.fetchQuery({
          queryKey: mappedQueryKey,
          queryFn: fetchFn,
          staleTime: 0,
        });
      } else {
        // Just a manual fetch if no query key mapped
        await fetchFn();
        // Since we don't have a query key, we can't easily "show" it in the inspector
        // unless we temporarily store it in local state.
        // But the requirement is "show data in state we have for that endpoint".
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">System Inspector</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Inspect API routes and their currently cached state.
          </p>
        </div>
      </div>

      <div className="grid flex-1 items-stretch gap-6 md:grid-cols-12">
        {/* Sidebar: Endpoint List */}
        <Card className="flex h-[700px] flex-col overflow-hidden md:col-span-4 lg:col-span-3">
          <CardHeader className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Endpoints</CardTitle>
              <Badge variant="outline" className="font-mono">
                {filteredRoutes.length}
              </Badge>
            </div>
            <div className="relative">
              <IconSearch className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Filter endpoints..."
                className="h-9 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-auto">
              <div className="flex flex-col">
                {filteredRoutes.map((route) => {
                  const isActive = selectedKey === route.key;
                  const hasCache = !!queryClient.getQueryData(routeToQueryKeyMap[route.key] || []);

                  return (
                    <button
                      key={route.key}
                      onClick={() => setSelectedKey(route.key)}
                      className={cn(
                        "hover:bg-muted/50 flex flex-col items-start gap-1 border-b p-4 text-left text-sm transition-all last:border-0",
                        isActive && "bg-muted ring-primary/20 shadow-sm ring-1 ring-inset",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate font-bold">
                          {route.key}
                        </span>
                        {hasCache && (
                          <div
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                            title="Cached"
                          />
                        )}
                      </div>
                      <span className="text-muted-foreground w-full truncate font-mono text-xs">
                        {route.method} {route.path}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 py-0 text-[10px] font-bold uppercase"
                        >
                          {route.domainName}
                        </Badge>
                        <Badge variant="outline" className="h-4 px-1 py-0 text-[10px] uppercase">
                          {route.status}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content: Endpoint Detail */}
        <Card className="flex h-[700px] flex-col overflow-hidden md:col-span-8 lg:col-span-9">
          {selectedRoute ? (
            <>
              <CardHeader className="bg-muted/20 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <IconRoute className="text-primary h-5 w-5" />
                      {selectedRoute.key}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {selectedRoute.method} {selectedRoute.path}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFetch}
                      disabled={isFetching || !mappedQueryKey || selectedRoute.method !== "GET"}
                    >
                      {isFetching ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <IconRefresh className="mr-2 h-4 w-4" />
                      )}
                      Fetch / Refetch
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col overflow-hidden p-0 md:flex-row">
                {/* Info Panel */}
                <div className="bg-muted/10 w-full space-y-6 overflow-y-auto border-r p-6 md:w-64">
                  <div className="space-y-4">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      Metadata
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-[10px] uppercase">Domain</span>
                        <span className="text-sm font-medium">{selectedRoute.domainName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-[10px] uppercase">
                          Description
                        </span>
                        <span className="text-sm">
                          {selectedRoute.description || "No description provided."}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-[10px] uppercase">
                          Protection
                        </span>
                        <div className="mt-1 flex gap-1">
                          {selectedRoute.authRequired && (
                            <Badge variant="secondary" className="text-[10px]">
                              AUTH
                            </Badge>
                          )}
                          {selectedRoute.adminOnly && (
                            <Badge variant="destructive" className="text-[10px]">
                              ADMIN
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      Cache State
                    </h4>
                    {cacheState ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[10px] uppercase">
                            Status
                          </span>
                          <Badge
                            variant={cacheState.status === "success" ? "default" : "secondary"}
                            className={cn(
                              "w-fit",
                              cacheState.status === "success" &&
                                "border-emerald-500/20 bg-emerald-500/15 text-emerald-700",
                            )}
                          >
                            {cacheState.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[10px] uppercase">
                            Last Updated
                          </span>
                          <span className="font-mono text-xs italic">
                            {cacheState.dataUpdatedAt
                              ? new Date(cacheState.dataUpdatedAt).toLocaleTimeString()
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[10px] uppercase">
                            Query Key
                          </span>
                          <span className="bg-muted rounded p-1 font-mono text-[10px] break-all">
                            {JSON.stringify(mappedQueryKey)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <p className="text-muted-foreground text-xs italic">
                          No cache entry found.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data View */}
                <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      variant="outline"
                      className="border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-400"
                    >
                      JSON
                    </Badge>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <div className="p-6">
                      {cacheData ? (
                        <pre className="font-mono text-xs whitespace-pre-wrap text-emerald-400/90">
                          {JSON.stringify(cacheData, null, 2)}
                        </pre>
                      ) : (
                        <div className="flex h-[500px] flex-col items-center justify-center gap-4 text-center text-zinc-500">
                          <IconServer className="h-10 w-10 opacity-20" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">No data in state</p>
                            <p className="max-w-[200px] text-xs">
                              Fetch data or check an endpoint that is already active in the app.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full flex-1 items-center justify-center">
              <div className="flex max-w-sm flex-col items-center gap-4 text-center">
                <div className="bg-primary/5 flex h-20 w-20 items-center justify-center rounded-full">
                  <IconDatabase className="text-primary/40 h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">No Endpoint Selected</h3>
                  <p className="text-muted-foreground text-sm">
                    Select an endpoint from the left-hand menu to inspect its current state and
                    metadata.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
