import { HelpCircle, LifeBuoy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/**
 * PublicTopBar: Provides lightweight navigation and brand framing.
 */
export function PublicTopBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="transition-opacity hover:opacity-90">
          <img src="/logos/apple-touch-icon.png" alt="Fixtura Home" className="h-8 w-8" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href={ROUTES.help} aria-label="Support">
                    <LifeBuoy className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Support</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href={ROUTES.help} aria-label="Help Center">
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
    </header>
  );
}

/**
 * PublicFooter: Provides legal and support links.
 */
export function PublicFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-muted-foreground text-sm font-medium">
            © {new Date().getFullYear()} Fixtura. All rights reserved.
          </div>
          <div className="text-muted-foreground flex gap-x-8 text-sm font-medium">
            <Link href={ROUTES.help} className="hover:text-foreground transition-colors">
              Support
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * PublicPageWrapper: Defines page-level vertical structure.
 */
export function PublicPageWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background selection:bg-brand/10 relative flex min-h-screen flex-col overflow-hidden",
        className,
      )}
    >
      {/* Decorative premium background elements */}
      <div className="bg-primary/10 absolute top-0 right-0 -z-10 h-96 w-96 rounded-full opacity-50 blur-3xl sm:opacity-100" />
      <div className="bg-brand-secondary/15 absolute bottom-40 left-0 -z-10 h-96 w-96 rounded-full opacity-50 blur-3xl sm:opacity-100" />

      <PublicTopBar />
      <main className="flex-1 py-12">{children}</main>
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
