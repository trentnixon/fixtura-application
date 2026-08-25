import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { ClubLogoEditorScreen } from "../_components/club-logo-editor-screen";

export const metadata = buildPageMetadata({
  title: "Club logo",
  description: "Upload and crop a logo for a club in your association.",
});

export default async function ClubLogoEditorPage({
  params,
}: {
  params: Promise<{ accountId: string; clubId: string }>;
}) {
  const { accountId, clubId } = await params;

  return <ClubLogoEditorScreen accountId={accountId} clubId={clubId} />;
}
