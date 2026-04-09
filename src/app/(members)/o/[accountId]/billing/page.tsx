import { BillingContent } from "./billing-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Subscription status, invoices, and payment history for this account (read-only).
        </p>
      </div>
      <BillingContent accountId={accountId} />
    </div>
  );
}
