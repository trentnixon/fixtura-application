import { BrandLogoScreen } from "./_components/brand-logo-screen";

export default async function BrandLogoPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return <BrandLogoScreen accountId={accountId} />;
}
