import { AddSponsorScreen } from "./_components/add-sponsor-screen";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <AddSponsorScreen accountId={accountId} />;
}
