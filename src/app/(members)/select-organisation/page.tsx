"use client";

import Link from "next/link";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

export default function SelectOrganisationPage() {
  const { data, isPending, isError, refetch } = useAccountMe();

  if (isPending) {
    return <BrandedLoader fullPage label="Loading your organisations" />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-8">
        <ErrorState
          title="Could not load accounts"
          description={AUTH_ERROR_MESSAGES.network}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const accounts = data?.data?.accounts ?? [];
  const rows =
    accounts.length > 0
      ? accounts
      : data?.data?.accountId != null
        ? [
            {
              id: data.data.accountId,
              contentHub: data.data.contentHub,
            },
          ]
        : [];

  return (
    <div className="mx-auto grid w-full max-w-lg gap-6 py-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Select organisation</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose which organisation you want to work in. You can switch later from the sidebar.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No organisations yet</CardTitle>
            <CardDescription>
              When your CMS account has organisations, they will appear here. Create flow is coming
              soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={ROUTES.createOrganisation}>Create organisation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {rows.map((a) => {
            const id = String(a.id);
            const name = a.contentHub?.accountOrganisationDetails?.Name ?? `Account ${id}`;
            const sport = a.contentHub?.accountOrganisationDetails?.Sport;
            return (
              <li key={id}>
                <Card className="hover:bg-muted/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{name}</CardTitle>
                      {sport ? <CardDescription className="mt-1">{sport}</CardDescription> : null}
                    </div>
                    <Button asChild size="sm">
                      <Link href={accountScopedRoutes.dashboard(id)}>Open</Link>
                    </Button>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-muted-foreground text-center text-xs">
        Need another organisation?{" "}
        <Link
          href={ROUTES.createOrganisation}
          className="text-primary underline-offset-4 hover:underline"
        >
          Create organisation
        </Link>
      </p>
    </div>
  );
}
