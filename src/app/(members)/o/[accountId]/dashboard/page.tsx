import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { TempOrgDataDump } from "./temp-data-drilling/temp-org-data-dump";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description: "View your organisation overview and tools in Fixtura Members.",
});

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organisation data (temporary — for development visibility)
        </p>
      </div>
      <TempOrgDataDump accountId={accountId} />
    </div>
  );
}
