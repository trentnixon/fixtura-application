import { AssignSponsorsWorkspace } from "../../_components/assignment/assign-sponsors-workspace";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return <AssignSponsorsWorkspace accountId={accountId} mode="entity" />;
}
