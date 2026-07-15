"use client";

import {
  TemplateNoiseCardPicker,
  TemplateNoisePickerDetail,
  TemplateNoiseSelectPicker,
  useTemplateNoisePickerList,
} from "@/components/pickers/template-noise";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";
import { appRoutes } from "@/lib/api/routes/route-definitions";

export default function DataLabTemplateNoisesUiPage() {
  const q = useTemplateNoisePickerList(PICKER_SANDBOX_ACCOUNT_SCOPE);
  const noises = q.noises;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Template noises — UI endpoint
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.templateNoises.ui.path}
          </code>{" "}
          (BFF → Strapi). Sign in first; unauthenticated requests return 401 and missing CMS
          permission returns 403.
        </TypographyMuted>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void q.refetch()}>
          Refetch
        </Button>
        {q.isFetching && !q.isPending ? (
          <TypographyMuted className="text-xs">Refreshing…</TypographyMuted>
        ) : null}
      </div>

      {q.isPending ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading…
        </p>
      ) : q.isError ? (
        <div className="space-y-2">
          <TypographyMuted className="text-destructive text-sm">
            {q.error instanceof Error ? q.error.message : "Request failed"}
          </TypographyMuted>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs" role="status">
            template noises: {noises.length} (published only)
          </p>

          {noises.length === 0 ? (
            <TypographyMuted className="text-sm">No template noises returned.</TypographyMuted>
          ) : (
            <>
              <TypographyMuted className="text-xs leading-relaxed">
                Persist and compare noise using <span className="font-mono">ui.type</span> (same as
                scheduler/account <span className="font-mono">noise.type</span>).{" "}
                <span className="font-mono">name</span> is for display only.
              </TypographyMuted>

              <Tabs defaultValue="select" className="w-full">
                <TabsList className="bg-muted text-muted-foreground inline-flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-lg border p-1 sm:w-auto">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-2">
                  <TemplateNoiseSelectPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>

                <TabsContent value="cards" className="space-y-2">
                  <TemplateNoiseCardPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>
              </Tabs>

              <TemplateNoisePickerDetail accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
