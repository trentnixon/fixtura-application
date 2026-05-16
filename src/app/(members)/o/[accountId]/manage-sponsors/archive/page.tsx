import { SponsorArchiveWorkspace } from "../_components/archive/sponsor-archive-workspace";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <SponsorArchiveWorkspace accountId={accountId} />;
}
