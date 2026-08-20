import { LifeBuoy } from "lucide-react";

import { AuthSurface } from "@/components/auth/structure";
import {
  TypographyEyebrow,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import { EXTERNAL_LINKS } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type SignInPageLayoutProps = {
  form: ReactNode;
};

/**
 * Shared layout and copy for public sign-in routes. Form markup lives in LoginForm.
 */
export function SignInPageLayout({ form }: SignInPageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 py-8 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="flex flex-col justify-center">
          <header className={cn("flex flex-col space-y-6 text-center", "lg:text-left")}>
            <div className={cn("flex justify-center", "lg:justify-start")}>
              <img
                src="/logos/apple-touch-icon.png"
                alt="Fixtura"
                className="h-20 w-20 lg:h-24 lg:w-24"
              />
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <TypographyEyebrow>Fixtura Members</TypographyEyebrow>
                  <TypographyPageTitle className="font-brand font-bold">
                    Welcome back
                  </TypographyPageTitle>
                  <TypographyPageDescription className="text-sm leading-relaxed lg:text-base">
                    Sign in to manage your competitions, branding, and weekly deliverables.
                  </TypographyPageDescription>
                </div>

                <p className="text-muted-foreground text-sm">
                  Need a hand?{" "}
                  <a
                    href={EXTERNAL_LINKS.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary inline-flex items-center gap-1.5 font-medium underline-offset-4 transition-colors hover:underline"
                  >
                    <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden />
                    Contact the team
                  </a>
                </p>
              </div>

              <div
                aria-hidden
                className="from-brand-secondary/10 to-primary/10 pointer-events-none absolute top-full left-1/2 h-84 w-84 -translate-x-1/2 translate-y-6 rounded-full bg-gradient-to-bl blur-[50px] sm:h-96 sm:w-96 sm:translate-y-8 lg:h-[27rem] lg:w-[27rem]"
              />
            </div>
          </header>
        </div>

        <div className="flex w-full max-w-md items-center justify-self-center lg:max-w-none lg:justify-self-end">
          <AuthSurface className="border-white/40 shadow-[0_12px_40px_0_rgba(31,38,135,0.08)]">
            {form}
          </AuthSurface>
        </div>
      </div>
    </div>
  );
}
