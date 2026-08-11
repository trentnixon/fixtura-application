import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BillingLabSuccessClient } from "../_components/billing-lab-success-client";

function firstString(value: string | string[] | undefined): string | null {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value || null;
}

export default async function RouteLabBillingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { accountId } = await params;
  const sp = await searchParams;
  const sessionId = firstString(sp["session_id"]);
  const baselineScenario = firstString(sp["scenario"]) ?? "checkout_started";
  const productionRoute = accountScopedRoutes.billing(accountId);

  return (
    <RouteLabPage
      title="Billing success return (LABS)"
      productionRoute={productionRoute}
      description="Simulated post-checkout success URL only. Toggle interpretations below — no live payment verification."
      contentPreset="full"
      stateOptions={[]}
      modeOptions={[]}
    >
      <BillingLabSuccessClient
        accountId={accountId}
        sessionId={sessionId}
        baselineScenario={baselineScenario}
      />
    </RouteLabPage>
  );
}
