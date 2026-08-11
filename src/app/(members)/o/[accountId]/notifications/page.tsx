import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { NotificationsContent } from "./notifications-content";

export const metadata = buildPageMetadata({
  title: "Notifications",
  description:
    "Delivery and notification preferences for your Fixtura Members organisation account.",
});

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <NotificationsContent accountId={accountId} />
    </div>
  );
}
