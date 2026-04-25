"use client";

import {
  TemplateModeCardPicker,
  TemplateModePickerDetail,
  TemplateModeSelectPicker,
  useTemplateModePickerList,
} from "@/components/pickers/template-mode";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appRoutes } from "@/lib/api/routes/route-definitions";

export default function DataLabTemplateModesUiPage() {
  const { modes, refetch, isFetching, isPending, isError, error } = useTemplateModePickerList();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Template modes — UI endpoint
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.templateModes.ui.path}
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
            template modes: {modes.length} (published only)
          </p>

          {modes.length === 0 ? (
            <TypographyMuted className="text-sm">No template modes returned.</TypographyMuted>
          ) : (
            <>
              <TypographyMuted className="text-xs leading-relaxed">
                Persist and compare mode using <span className="font-mono">slug</span>, not{" "}
                <span className="font-mono">id</span>.
              </TypographyMuted>

              <Tabs defaultValue="select" className="w-full">
                <TabsList className="bg-muted text-muted-foreground inline-flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-lg border p-1 sm:w-auto">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-2">
                  <TemplateModeSelectPicker />
                </TabsContent>

                <TabsContent value="cards" className="space-y-2">
                  <TemplateModeCardPicker />
                </TabsContent>
              </Tabs>

              <TemplateModePickerDetail />
            </>
          )}
        </div>
      )}
    </div>
  );
}
