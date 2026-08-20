import { LifeBuoy } from "lucide-react";
import Link from "next/link";

import { TypographyBodySmall } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EXTERNAL_LINKS, ROUTES } from "@/lib/config/routes";
import { isDevSandboxEnabled } from "@/lib/dev-sandbox";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/**
 * PublicTopBar: Provides lightweight navigation and brand framing.
 */
export function PublicTopBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href={EXTERNAL_LINKS.website}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-90"
        >
          <img src="/logos/apple-touch-icon.png" alt="Fixtura" className="h-8 w-8" />
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          {isDevSandboxEnabled ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground mr-1 font-medium"
            >
              <Link href={ROUTES.sandbox}>Sandbox</Link>
            </Button>
          ) : null}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <a
                    href={EXTERNAL_LINKS.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contact"
                  >
                    <LifeBuoy className="h-5 w-5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Contact</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
    </header>
  );
}

/**
 * PublicFooter: Copyright notice for public/signed-out pages.
 */
export function PublicFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <TypographyBodySmall as="div" tone="muted" className="text-center font-medium">
          © {new Date().getFullYear()} Fixtura. All rights reserved.
        </TypographyBodySmall>
      </div>
    </footer>
  );
}

/**
 * PublicPageWrapper: Defines page-level vertical structure.
 * Use `contentAs="div"` when children include their own `<main>` (e.g. sandbox tool layouts with a sidebar).
 */
export function PublicPageWrapper({
  children,
  className,
  contentAs = "main",
}: {
  children: ReactNode;
  className?: string;
  /** `div` avoids invalid nested `<main>` when a child layout renders `<main>`. */
  contentAs?: "main" | "div";
}) {
  const Content = contentAs === "main" ? "main" : "div";

  return (
    <div
      className={cn(
        "selection:bg-brand/10 relative flex min-h-screen flex-col overflow-hidden bg-[rgb(254,254,254)]",
        className,
      )}
    >
      <PublicTopBar />
      <Content
        className={cn(
          "public-page-motif relative flex-1 overflow-hidden",
          contentAs === "main" ? "py-12" : "py-0",
        )}
      >
        <div
          aria-hidden
          className="bg-primary/10 pointer-events-none absolute top-0 right-0 -z-10 h-96 w-96 rounded-full opacity-50 blur-3xl sm:opacity-100"
        />
        <div
          aria-hidden
          className="bg-brand-secondary/15 pointer-events-none absolute bottom-20 left-0 -z-10 h-96 w-96 rounded-full opacity-50 blur-3xl sm:opacity-100"
        />
        <div className="relative z-10">{children}</div>
      </Content>
      <PublicFooter />
    </div>
  );
}

/**
 * PublicShellContainer: Share responsive width constraint.
 */
export function PublicShellContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/**
 * AuthContentContainer: Constrains auth-specific content to narrower width.
 */
export function AuthContentContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-md px-4 sm:px-0", className)}>{children}</div>;
}

/**
 * AuthPageSection: Consistent vertical spacing between auth blocks.
 */
export function AuthPageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("space-y-6", className)}>{children}</section>;
}
