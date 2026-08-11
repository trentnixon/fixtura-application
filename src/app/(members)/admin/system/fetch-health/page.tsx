"use client";

import {
  IconActivity,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconRefresh,
  IconRoute,
  IconUser,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";

import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchHealth } from "@/lib/api/hooks/admin/useFetchHealth";
import { useCurrentUser } from "@/lib/api/hooks/auth/useCurrentUser";

/**
 * Admin Diagnostic Page for Fetch Client and API Health.
 * Displays the status of registered routes and implementation progress.
 */
export default function FetchHealthPage() {
  const { data, isLoading, refetch, isFetching } = useFetchHealth();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const handleManualCheck = async () => {
    await refetch();
    setLastCheck(new Date());
  };

  const overallStatus = data?.overallStatus ?? "unknown";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">API & Fetch Health</h1>
          <p className="text-muted-foreground group flex items-center gap-2">
            System diagnostics for application routes and implementation status.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleManualCheck}
          disabled={isFetching}
          className="w-fit"
        >
          {isFetching ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconRefresh className="mr-2 h-4 w-4" />
          )}
          Run Full Diagnostic
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <TypographyCardTitle as="span" className="text-sm font-medium italic sm:text-sm">
                Service Status
              </TypographyCardTitle>
            </CardTitle>
            <IconActivity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {overallStatus === "ok" ? (
                <IconCircleCheck className="h-6 w-6 text-emerald-500" />
              ) : (
                <IconCircleX className="h-6 w-6 text-rose-500" />
              )}
              <span className="text-2xl font-bold uppercase">{overallStatus}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {lastCheck ? `Checked ${format(lastCheck, "HH:mm:ss")}` : "Not checked yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <TypographyCardTitle as="span" className="text-sm font-medium italic sm:text-sm">
                Route Registry
              </TypographyCardTitle>
            </CardTitle>
            <IconRoute className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Total</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Across 6 domains (Auth, Account...)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <TypographyCardTitle as="span" className="text-sm font-medium italic sm:text-sm">
                Logged User
              </TypographyCardTitle>
            </CardTitle>
            <IconUser className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ) : userData?.user ? (
              (() => {
                const { user } = userData;
                return (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={user.avatar} alt={user.name ?? "User"} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {(user.name?.[0] ?? user.email?.[0])?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">
                          {user.name ?? "Anonymous User"}
                        </span>
                        <Badge variant="outline" className="h-4 px-1 text-[10px] uppercase">
                          {user.role}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground truncate text-xs italic">
                        {user.email}
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center gap-2 text-rose-500">
                <IconCircleX className="h-4 w-4" />
                <span className="text-sm font-medium">Session Error</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registry Detail */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle>
            <TypographyCardTitle as="span">Route Implementation Registry</TypographyCardTitle>
          </CardTitle>
          <CardDescription>
            <TypographyCardDescription as="span">
              Official registry of all application endpoints and their development readiness.
            </TypographyCardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">Method</TableHead>
                <TableHead>Key & Path</TableHead>
                <TableHead>Protection</TableHead>
                <TableHead className="text-right">Implementation Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results.map((result) => (
                <TableRow key={result.key}>
                  <TableCell>
                    <Badge
                      variant={result.method === "GET" ? "secondary" : "outline"}
                      className="font-mono"
                    >
                      {result.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{result.key}</span>
                      <span className="text-muted-foreground font-mono text-xs">{result.path}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        Auth
                      </Badge>
                      {result.key.startsWith("admin") && (
                        <Badge variant="destructive" className="text-[10px]">
                          Admin Only
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={result.status === "ok" ? "default" : "secondary"}
                      className={
                        result.status === "ok"
                          ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-700"
                          : ""
                      }
                    >
                      {result.status === "ok" ? "Ready" : "Planned"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!data || data.results.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                    Run a diagnostic to populate the route table.
                  </TableCell>
                </TableRow>
              )}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <IconLoader2 className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
