import { BrandingApiDump } from "./branding-api-dump";

export default async function BrandingPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Branding</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          GET /api/accounts/:id/branding (temporary — development visibility)
        </p>
      </div>
      <BrandingApiDump accountId={accountId} />
    </div>
  );
}
