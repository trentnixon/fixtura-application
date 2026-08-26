import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SortOrderContent } from "./sort-order-content";

export const metadata = buildPageMetadata({
  title: "Sort Order",
  description: "Set the grade order for your organisation.",
});

export default async function SortOrderPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <SortOrderContent accountId={accountId} />
    </div>
  );
}
