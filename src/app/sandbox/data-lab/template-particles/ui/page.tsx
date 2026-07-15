"use client";

import {
  TemplateParticleCardPicker,
  TemplateParticlePickerDetail,
  TemplateParticleSelectPicker,
  useTemplateParticlePickerList,
} from "@/components/pickers/template-particle";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";
import { appRoutes } from "@/lib/api/routes/route-definitions";

export default function DataLabTemplateParticlesUiPage() {
  const { particles, refetch, isFetching, isPending, isError, error } =
    useTemplateParticlePickerList(PICKER_SANDBOX_ACCOUNT_SCOPE);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Template particles — UI endpoint
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.templateParticles.ui.path}
          </code>{" "}
          (BFF → Strapi). Sign in first; unauthenticated requests return 401 and missing CMS
          permission returns 403.
        </TypographyMuted>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Refetch
        </Button>
        {isFetching && !isPending ? (
          <TypographyMuted className="text-xs">Refreshing…</TypographyMuted>
        ) : null}
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading…
        </p>
      ) : isError ? (
        <div className="space-y-2">
          <TypographyMuted className="text-destructive text-sm">
            {error instanceof Error ? error.message : "Request failed"}
          </TypographyMuted>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs" role="status">
            template particles: {particles.length} (published only)
          </p>

          {particles.length === 0 ? (
            <TypographyMuted className="text-sm">No template particles returned.</TypographyMuted>
          ) : (
            <>
              <TypographyMuted className="text-xs leading-relaxed">
                <span className="font-mono">name</span> is for display.{" "}
                <span className="font-mono">ui.type</span>,{" "}
                <span className="font-mono">ui.animation</span>,{" "}
                <span className="font-mono">ui.direction</span>,{" "}
                <span className="font-mono">ui.particleCount</span>, and{" "}
                <span className="font-mono">ui.speed</span> are the app-facing particle settings
                (aligned with saved account/template options — not raw CMS field names like{" "}
                <span className="font-mono">particleType</span> or{" "}
                <span className="font-mono">animationType</span>).
              </TypographyMuted>

              <Tabs defaultValue="select" className="w-full">
                <TabsList className="bg-muted text-muted-foreground inline-flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-lg border p-1 sm:w-auto">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-2">
                  <TemplateParticleSelectPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>

                <TabsContent value="cards" className="space-y-2">
                  <TemplateParticleCardPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>
              </Tabs>

              <TemplateParticlePickerDetail accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
