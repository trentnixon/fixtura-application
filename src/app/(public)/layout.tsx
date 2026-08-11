import { PublicPageWrapper, PublicShellContainer } from "@/components/auth/layout";

import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicPageWrapper>
      <PublicShellContainer>{children}</PublicShellContainer>
    </PublicPageWrapper>
  );
}
