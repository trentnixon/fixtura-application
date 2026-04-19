"use client";

import { TypographyH3, TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTemplateCategoryPickerList } from "./_hooks";
import { divideFixturesRows } from "./_utils";

import type { AudioOptionItem, TemplateCategoryCatalogItem } from "./_types";

function AudioOptionsTable({ options }: { options: AudioOptionItem[] }) {
  if (options.length === 0) {
    return (
      <TypographyMuted className="text-sm italic">No audio options in this bundle.</TypographyMuted>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[180px]">Name</TableHead>
            <TableHead className="w-[160px]">Composition</TableHead>
            <TableHead className="w-[140px]">Component</TableHead>
            <TableHead>URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="align-top font-medium">{row.name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground align-top font-mono text-xs">
                {row.compositionId ?? "—"}
              </TableCell>
              <TableCell className="align-top text-sm">{row.componentName ?? "—"}</TableCell>
              <TableCell className="align-top text-xs">
                {row.url ? (
                  <a
                    className="text-primary break-all underline-offset-2 hover:underline"
                    href={row.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {row.url}
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CategoryDetailBody({ category }: { category: TemplateCategoryCatalogItem }) {
  const fixtureRows = divideFixturesRows(category.divideFixturesBy);
  const bundle = category.bundleAudio;

  return (
    <Surface className="max-h-[min(70vh,48rem)] space-y-6 overflow-auto p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <TypographyH3 className="text-lg font-semibold tracking-tight">
            {category.name ?? `Category ${category.id}`}
          </TypographyH3>
          <TypographyMuted className="text-sm">
            <span className="font-mono">id {category.id}</span>
            {category.slug ? (
              <>
                {" "}
                · slug <span className="font-mono">{category.slug}</span>
              </>
            ) : null}
          </TypographyMuted>
        </div>
        <Badge variant={category.isPrivate ? "secondary" : "outline"}>
          {category.isPrivate ? "Private" : "Public"}
        </Badge>
      </div>

      <Separator />

      <section className="space-y-3">
        <TypographyH4 className="text-sm font-semibold">Divide fixtures by</TypographyH4>
        {fixtureRows.length === 0 ? (
          <TypographyMuted className="text-sm italic">Not set.</TypographyMuted>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="min-w-[200px]">Composition / key</TableHead>
                  <TableHead className="w-24 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixtureRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-mono text-xs">{row.key}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {row.display}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <TypographyH4 className="text-sm font-semibold">Bundle audio</TypographyH4>
        {bundle === null ? (
          <TypographyMuted className="text-sm italic">No bundle linked.</TypographyMuted>
        ) : (
          <Card className="border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{bundle.name ?? "Bundle"}</CardTitle>
              <TypographyMuted className="font-mono text-xs">bundle id {bundle.id}</TypographyMuted>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
                Audio options ({bundle.audioOptions.length})
              </TypographyMuted>
              <AudioOptionsTable options={bundle.audioOptions} />
            </CardContent>
          </Card>
        )}
      </section>
    </Surface>
  );
}

/** Self-contained: loads categories + shared selection and renders the active row. */
export function TemplateCategoryPickerDetail() {
  const { selectedCategory } = useTemplateCategoryPickerList();

  if (selectedCategory) {
    return <CategoryDetailBody category={selectedCategory} />;
  }

  return <TypographyMuted className="text-sm">Select a category to view details.</TypographyMuted>;
}
