"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { toastError } from "./notify";

import type { PropsWithChildren } from "react";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        globalThis.console?.error?.("Query error:", error);
        toastError(error, "Request failed");
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        globalThis.console?.error?.("Mutation error:", error);
        toastError(error, "Action failed");
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (String(error).includes("404")) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => createQueryClient());
  const isDev = process.env.NODE_ENV !== "production"; // eslint-disable-line no-undef
  return (
    <QueryClientProvider client={client}>
      {children}
      {isDev ? <ReactQueryDevtools initialIsOpen={false} position="right" /> : null}
    </QueryClientProvider>
  );
}
