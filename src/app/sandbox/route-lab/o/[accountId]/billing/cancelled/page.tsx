import Link from "next/link";

import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

function firstString(value: string | string[] | undefined): string | null {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value || null;
}

export default async function RouteLabBillingCancelledPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { accountId } = await params;
  const sp = await searchParams;
  const sessionId = firstString(sp["session_id"]);
  const productionRoute = accountScopedRoutes.billing(accountId);
  const billingLabHref = `${ROUTES.routeLab}/o/${accountId}/billing`;

  return (
    <RouteLabPage
      title="Billing cancelled return (LABS)"
      productionRoute={productionRoute}
      description="Simulated checkout cancellation — no charge. Use links below to continue in the lab."
      contentPreset="full"
      stateOptions={[]}
      modeOptions={[]}
    >
      <Surface className="space-y-4 p-5">
        {sessionId ? (
          <TypographyMuted className="text-sm">
            Query <code className="text-xs">session_id</code>:{" "}
            <code className="text-xs">{sessionId}</code>
          </TypographyMuted>
        ) : (
          <TypographyMuted className="text-sm">
            No <code>session_id</code> in query.
          </TypographyMuted>
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={billingLabHref}>Back to billing lab</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`${billingLabHref}?state=payment_failed`}>Scenario: payment failed</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${billingLabHref}?state=invoice_requested`}>
              Try invoice instead (scenario)
            </Link>
          </Button>
        </div>
      </Surface>
    </RouteLabPage>
  );
}
