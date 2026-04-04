import type { ReactNode } from "react";

/**
 * Full-width dev tools chrome: sidebar flush to the viewport edge, wide content column.
 * Used under sandbox `PublicPageWrapper` (with `contentAs="div"`).
 */
export function SandboxToolsShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full min-w-0">
      {sidebar}
      <main className="bg-background text-foreground min-w-0 flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        <div className="mx-auto w-full max-w-[min(100%,92rem)]">{children}</div>
      </main>
    </div>
  );
}
