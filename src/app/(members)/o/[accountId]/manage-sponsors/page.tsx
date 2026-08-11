import { ManageSponsorsWorkspace } from "./_components/overview/manage-sponsors-workspace";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <ManageSponsorsWorkspace accountId={accountId} />;
}
