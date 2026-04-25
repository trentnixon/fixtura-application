import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonOverview } from "./_components/season-overview";

export const metadata = buildPageMetadata({
  title: "Season",
  description: "Explore competitions, grades, and fixtures for your organisation.",
});

export default async function SeasonPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Season</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview from season hub — competitions and scope for this account.
        </p>
      </div>
      <SeasonOverview accountId={accountId} />
    </div>
  );
}
