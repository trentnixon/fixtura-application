"use client";

import { useMemo, useState } from "react";

import {
  TemplateCategoryCardPicker,
  TemplateCategoryComboboxPicker,
  TemplateCategoryPickerDetail,
  TemplateCategorySelectPicker,
  TemplateCategoryTogglePicker,
} from "@/components/pickers/template-category";
import { TypographyH1, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplateCategoriesListForSelection } from "@/lib/api/hooks/account/useTemplateCategoriesListForSelection";
import { appRoutes } from "@/lib/api/routes/route-definitions";

type InputPattern = "select" | "combobox" | "cards" | "toggle";

export default function DataLabTemplateCategoriesListForSelectionPage() {
  const q = useTemplateCategoriesListForSelection();
  const categories = useMemo(() => q.data?.data ?? [], [q.data]);
  const [pattern, setPattern] = useState<InputPattern>("select");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Data lab
        </TypographyMuted>
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Template categories — list for selection
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Calls{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            {appRoutes.account.templateCategoriesListForSelection.path}
          </code>{" "}
          (BFF → Strapi). Sign in first; unauthenticated requests return 401 and the app session
          handler redirects to sign-in.
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
            categories: {categories.length} (includes private rows)
          </p>

          {categories.length === 0 ? (
            <TypographyMuted className="text-sm">No categories returned.</TypographyMuted>
          ) : (
            <>
              <Tabs
                value={pattern}
                onValueChange={(v) => setPattern(v as InputPattern)}
                className="w-full"
              >
                <TabsList className="bg-muted text-muted-foreground inline-flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-lg border p-1 sm:w-auto">
                  <TabsTrigger value="select">Select</TabsTrigger>
                  <TabsTrigger value="combobox">Combobox</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="toggle">Toggle group</TabsTrigger>
                </TabsList>

                <TabsContent value="select" className="space-y-2">
                  <TemplateCategorySelectPicker />
                </TabsContent>

                <TabsContent value="combobox" className="space-y-2">
                  <TemplateCategoryComboboxPicker />
                </TabsContent>

                <TabsContent value="cards" className="space-y-2">
                  <TemplateCategoryCardPicker />
                </TabsContent>

                <TabsContent value="toggle" className="space-y-2">
                  <TemplateCategoryTogglePicker />
                </TabsContent>
              </Tabs>

              <TemplateCategoryPickerDetail />
            </>
          )}
        </div>
      )}
    </div>
  );
}
