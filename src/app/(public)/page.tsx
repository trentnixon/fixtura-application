import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { GlassSurface } from "@/components/ui/container";
import { ROUTES } from "@/lib/config/routes";

function LoginFormFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center py-12">
      <BrandedLoader size="sm" label="Awaiting Authenticator..." />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative mx-auto max-w-md space-y-8 pb-10">
      {/* Decorative premium background elements */}
      <div className="bg-primary/10 absolute top-0 right-0 -z-10 h-96 w-96 rounded-full opacity-50 blur-3xl sm:opacity-100" />
      <div className="bg-brand-secondary/10 absolute bottom-20 left-0 -z-10 h-72 w-72 rounded-full opacity-50 blur-2xl sm:opacity-100" />

      <div className="space-y-4 pt-6 text-center sm:pt-10">
        <div className="flex justify-center">
          <img src="/logos/apple-touch-icon.png" alt="Fixtura Logo" className="h-16 w-16" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-tight opacity-70">
            Sign in to access your members dashboard.
          </p>
        </div>
      </div>

      <GlassSurface className="overflow-hidden p-1 sm:p-1">
        <div className="rounded-[inherit] bg-white/40 p-8 sm:p-10 dark:bg-black/20">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </GlassSurface>

      <div className="space-y-6 pt-6 text-center">
        <div className="text-muted-foreground flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.2em] uppercase opacity-50">
          <span className="bg-border h-px flex-1" />
          <span>Support & Status</span>
          <span className="bg-border h-px flex-1" />
        </div>
        <div className="flex justify-center gap-10">
          <Link
            href={ROUTES.help}
            className="text-muted-foreground hover:text-primary text-[11px] font-bold tracking-widest uppercase transition-all"
          >
            System Pulse
          </Link>
          <Link
            href={ROUTES.help}
            className="text-muted-foreground hover:text-primary text-[11px] font-bold tracking-widest uppercase transition-all"
          >
            Direct Help
          </Link>
        </div>
      </div>
    </div>
  );
}
