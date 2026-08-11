"use client";

import {
  TemplateVideoCardPicker,
  TemplateVideoPickerDetail,
  TemplateVideoSelectPicker,
  useTemplateVideoPickerList,
} from "@/components/pickers/template-video";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";
import { appRoutes } from "@/lib/api/routes/route-definitions";

export default function DataLabTemplateVideosUiPage() {
  const { videos, refetch, isFetching, isPending, isError, error } = useTemplateVideoPickerList(
    PICKER_SANDBOX_ACCOUNT_SCOPE,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Template videos - UI endpoint
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.templateVideos.ui.path}
          </code>{" "}
          (BFF -&gt; Strapi). Sign in first; unauthenticated requests return 401 and missing CMS
          permission returns 403.
        </TypographyMuted>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Refetch
        </Button>
        {isFetching && !isPending ? (
          <TypographyMuted className="text-xs">Refreshing...</TypographyMuted>
        ) : null}
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading...
        </p>
      ) : isError ? (
        <TypographyMuted className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Request failed"}
        </TypographyMuted>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs" role="status">
            template videos: {videos.length} (published only)
          </p>

          {videos.length === 0 ? (
            <TypographyMuted className="text-sm">No template videos returned.</TypographyMuted>
          ) : (
            <>
              <Tabs defaultValue="select" className="w-full">
                <TabsList className="bg-muted text-muted-foreground inline-flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-lg border p-1 sm:w-auto">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-2">
                  <TemplateVideoSelectPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>

                <TabsContent value="cards" className="space-y-2">
                  <TemplateVideoCardPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
                </TabsContent>
              </Tabs>

              <TemplateVideoPickerDetail accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
