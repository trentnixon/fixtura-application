"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { InlineAlert } from "@/components/auth/actions";
import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/client/api-error";
import { useSupportDirectory } from "@/lib/api/hooks/account/useSupportDirectory";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { setSupportCustomerLabel } from "@/lib/support/support-customer-label";

import type {
  SupportDirectoryHealthStatus,
  SupportDirectoryParams,
  SupportDirectoryRow,
  SupportDirectorySort,
  SupportDirectorySport,
} from "@/types/api/account";

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 25;

const SPORT_OPTIONS: SupportDirectorySport[] = [
  "Cricket",
  "AFL",
  "Hockey",
  "Netball",
  "Basketball",
];

const HEALTH_OPTIONS: SupportDirectoryHealthStatus[] = [
  "not_started",
  "queued",
  "running",
  "completed",
  "failed",
];

function formatHealthLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function SupportAccountsContent() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sport, setSport] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [isSetup, setIsSetup] = useState<string>("all");
  const [healthStatus, setHealthStatus] = useState<string>("all");
  const [sort, setSort] = useState<SupportDirectorySort>("createdAt:desc");
  const [rateLimitRetryAt, setRateLimitRetryAt] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (rateLimitRetryAt == null) return;
    const remaining = rateLimitRetryAt - Date.now();
    if (remaining <= 0) {
      setRateLimitRetryAt(null);
      return;
    }
    const timer = window.setTimeout(() => setRateLimitRetryAt(null), remaining);
    return () => window.clearTimeout(timer);
  }, [rateLimitRetryAt]);

  const queryParams = useMemo((): SupportDirectoryParams => {
    const params: SupportDirectoryParams = {
      page,
      pageSize: PAGE_SIZE,
      sort,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (sport !== "all") params.sport = sport as SupportDirectorySport;
    if (isActive !== "all") params.isActive = isActive === "true";
    if (isSetup !== "all") params.isSetup = isSetup === "true";
    if (healthStatus !== "all") params.healthStatus = healthStatus as SupportDirectoryHealthStatus;
    return params;
  }, [debouncedSearch, healthStatus, isActive, isSetup, page, sort, sport]);

  const directoryQuery = useSupportDirectory(queryParams, {
    enabled: rateLimitRetryAt == null,
  });

  const handleOpenAccount = useCallback(
    (row: SupportDirectoryRow) => {
      const accountId = String(row.id);
      setSupportCustomerLabel(accountId, row.name);
      router.push(accountScopedRoutes.dashboard(accountId));
    },
    [router],
  );

  const error = directoryQuery.error;
  const isForbidden = error instanceof ApiError && error.status === 403;
  const isRateLimited = error instanceof ApiError && error.status === 429;

  useEffect(() => {
    if (!isRateLimited || !(error instanceof ApiError)) return;
    const seconds = error.retryAfterSeconds ?? 60;
    setRateLimitRetryAt(Date.now() + seconds * 1000);
  }, [error, isRateLimited]);

  const rows = directoryQuery.data?.data ?? [];
  const meta = directoryQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <TypographyPageTitle>Support accounts</TypographyPageTitle>
        <TypographyBodySmall className="text-muted-foreground">
          Browse customer organisations in read-only support view. Select an account to open the
          member dashboard.
        </TypographyBodySmall>
      </div>

      {isForbidden ? (
        <InlineAlert
          variant="destructive"
          message="You do not have access to the support directory."
        />
      ) : null}

      {isRateLimited ? (
        <InlineAlert
          variant="destructive"
          message="Too many directory requests. Please wait a moment and try again."
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-[200px] flex-1 flex-col gap-1">
          <TypographyCaption>Search</TypographyCaption>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, org, or email…"
            aria-label="Search support accounts"
          />
        </div>
        <FilterSelect
          label="Sport"
          value={sport}
          onChange={(v) => {
            setSport(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All sports" },
            ...SPORT_OPTIONS.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Active"
          value={isActive}
          onChange={(v) => {
            setIsActive(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Any" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
        />
        <FilterSelect
          label="Setup"
          value={isSetup}
          onChange={(v) => {
            setIsSetup(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Any" },
            { value: "true", label: "Setup complete" },
            { value: "false", label: "Not setup" },
          ]}
        />
        <FilterSelect
          label="Health"
          value={healthStatus}
          onChange={(v) => {
            setHealthStatus(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Any health" },
            ...HEALTH_OPTIONS.map((h) => ({ value: h, label: formatHealthLabel(h) })),
          ]}
        />
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={(v) => {
            setSort(v as SupportDirectorySort);
            setPage(1);
          }}
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
          ]}
        />
      </div>

      {directoryQuery.isPending ? (
        <TypographyBodySmall className="text-muted-foreground">
          Loading accounts…
        </TypographyBodySmall>
      ) : null}

      {directoryQuery.isError && !isForbidden && !isRateLimited ? (
        <InlineAlert
          variant="destructive"
          message={error instanceof Error ? error.message : "Could not load the support directory."}
        />
      ) : null}

      {!directoryQuery.isPending && !directoryQuery.isError && rows.length === 0 ? (
        <TypographyBodySmall className="text-muted-foreground">
          No accounts match your filters.
        </TypographyBodySmall>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.ownerEmail ?? "—"}</TableCell>
                  <TableCell>{row.accountType}</TableCell>
                  <TableCell>{row.sport ?? "—"}</TableCell>
                  <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.isSetup ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.onboardingStatus}</TableCell>
                  <TableCell>{row.accountHealthStatus ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenAccount(row)}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <TypographyCaption>
            Page {meta.page} of {meta.totalPages} ({meta.total} accounts)
          </TypographyCaption>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <TypographyBodySmall className="text-muted-foreground">
        Need your own organisation?{" "}
        <Link
          href={ROUTES.selectOrganisation}
          className="text-primary underline-offset-4 hover:underline"
        >
          My organisations
        </Link>
      </TypographyBodySmall>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <TypographyCaption>{label}</TypographyCaption>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
