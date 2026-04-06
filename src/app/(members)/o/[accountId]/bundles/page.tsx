import { BundlesApiDump } from "./bundles-api-dump";

export default async function BundlesPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Bundles</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Phases 5–8 API JSON (temporary — development visibility)
        </p>
      </div>
      <BundlesApiDump accountId={accountId} />
    </div>
  );
}
