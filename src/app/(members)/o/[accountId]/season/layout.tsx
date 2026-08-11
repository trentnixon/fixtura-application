import { SeasonOnboardingShell } from "./_components/season-onboarding-shell";

import type { ReactNode } from "react";

export default async function SeasonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <SeasonOnboardingShell accountId={accountId}>{children}</SeasonOnboardingShell>;
}
