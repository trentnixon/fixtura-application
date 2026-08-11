"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplatePatternPickerList } from "./_hooks";
import { patternLabel, valueLabel } from "./_utils";

export function TemplatePatternCardPicker({ accountId }: { accountId: string }) {
  const { patterns, selectValue, setSelectedId } = useTemplatePatternPickerList(accountId);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {patterns.map((pattern) => {
        const isSelected = String(pattern.id) === selectValue;
        return (
          <button
            key={pattern.id}
            type="button"
            onClick={() => setSelectedId(String(pattern.id))}
            className="text-left"
            aria-pressed={isSelected}
          >
            <Card
              className={cn(
                "h-full cursor-pointer transition",
                isSelected
                  ? "ring-primary bg-primary/5 ring-2"
                  : "hover:ring-primary/50 hover:bg-muted/40",
              )}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">{patternLabel(pattern)}</CardTitle>
                <CardDescription>ID: {pattern.id}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1 text-xs">
                <p>type: {valueLabel(pattern.ui.type)}</p>
                <p>animation: {valueLabel(pattern.ui.animation)}</p>
                <p>scale: {valueLabel(pattern.ui.scale)}</p>
                <p>rotation: {valueLabel(pattern.ui.rotation)}</p>
                <p>opacity: {valueLabel(pattern.ui.opacity)}</p>
                <p>animationDuration: {valueLabel(pattern.ui.animationDuration)}</p>
                <p>animationSpeed: {valueLabel(pattern.ui.animationSpeed)}</p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
