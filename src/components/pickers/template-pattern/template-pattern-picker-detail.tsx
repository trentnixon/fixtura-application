"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplatePatternPickerList } from "./_hooks";
import { valueLabel } from "./_utils";

export function TemplatePatternPickerDetail() {
  const { selectedPattern } = useTemplatePatternPickerList();

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg">Selected pattern detail</CardTitle>
        <CardDescription>Shared detail panel for the currently selected row.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {selectedPattern ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">id:</span> {selectedPattern.id}
              </p>
              <p>
                <span className="text-muted-foreground">name:</span>{" "}
                {selectedPattern.name ?? "null"}
              </p>
              <p>
                <span className="text-muted-foreground">ui.type:</span>{" "}
                {valueLabel(selectedPattern.ui.type)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.animation:</span>{" "}
                {valueLabel(selectedPattern.ui.animation)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.scale:</span>{" "}
                {valueLabel(selectedPattern.ui.scale)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.rotation:</span>{" "}
                {valueLabel(selectedPattern.ui.rotation)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.opacity:</span>{" "}
                {valueLabel(selectedPattern.ui.opacity)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.animationDuration:</span>{" "}
                {valueLabel(selectedPattern.ui.animationDuration)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.animationSpeed:</span>{" "}
                {valueLabel(selectedPattern.ui.animationSpeed)}
              </p>
            </div>
            <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
              {JSON.stringify(selectedPattern, null, 2)}
            </pre>
          </>
        ) : (
          <TypographyMuted>No selected template pattern.</TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}
