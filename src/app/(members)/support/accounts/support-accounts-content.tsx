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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/client/api-error";
import { useSupportDirectory } from "@/lib/api/hooks/account/useSupportDirectory";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { setSupportCustomerLabel } from "@/lib/support/support-customer-label";

import { SupportAccountsTable, SupportAccountsTableSkeleton } from "./support-accounts-table";

import type {
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

export function SupportAccountsContent() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sport, setSport] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [isSetup, setIsSetup] = useState<string>("all");
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
    return params;
  }, [debouncedSearch, isActive, isSetup, page, sort, sport]);

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

      {directoryQuery.isPending ? <SupportAccountsTableSkeleton /> : null}

      {directoryQuery.isError && !isForbidden && !isRateLimited ? (
        <InlineAlert
          variant="destructive"
          message={error instanceof Error ? error.message : "Could not load the support directory."}
        />
      ) : null}

      {!directoryQuery.isPending && !directoryQuery.isError && rows.length === 0 ? (
        <EmptyState title="No accounts" description="No accounts match your filters." />
      ) : null}

      {rows.length > 0 ? (
        <SupportAccountsTable
          rows={rows}
          {...(meta ? { meta } : {})}
          onOpen={handleOpenAccount}
          onPageChange={setPage}
        />
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
