import { Suspense } from "react";

import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { DashboardContent } from "./dashboard-content";

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
    <Suspense
      fallback={
        <p className="text-muted-foreground px-4 py-6 text-sm sm:px-6 lg:px-8">
          Loading dashboard…
        </p>
      }
    >
      <DashboardContent accountId={accountId} />
    </Suspense>
  );
}
