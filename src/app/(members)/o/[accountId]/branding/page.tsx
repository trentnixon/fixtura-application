import { BrandingScreen } from "./_components/branding-screen";

export default async function BrandingPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return <BrandingScreen accountId={accountId} />;
}
