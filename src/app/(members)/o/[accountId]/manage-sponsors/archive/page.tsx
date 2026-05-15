import { SponsorArchiveWorkspace } from "../_components/sponsor-archive-workspace";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <SponsorArchiveWorkspace accountId={accountId} />;
}
