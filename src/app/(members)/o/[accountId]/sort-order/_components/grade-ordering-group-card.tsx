"use client";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyFinePrint } from "@/components/typography";

import { GradeOrderingSaveFooter } from "./grade-ordering-save-footer";
import { SortableGradeList } from "./sortable-grade-list";

import type { GradeOrderingGradeLookup } from "../_hooks/use-grade-ordering-editor";
import type { GradeOrderingDraftGroup } from "../_utils/grade-ordering-draft";
import type { ComponentProps } from "react";

const GROUP_CARD_CLASS_NAME =
  "ring-border w-full min-w-0 rounded-2xl border-none shadow-none ring-1";

type GradeOrderingSaveFooterProps = ComponentProps<typeof GradeOrderingSaveFooter>;

export function GradeOrderingGroupCard({
  group,
  gradeLookup,
  onReorder,
  disabled,
  saveFooter,
}: {
  group: GradeOrderingDraftGroup;
  gradeLookup: GradeOrderingGradeLookup;
  onReorder: (itemIds: number[]) => void;
  disabled?: boolean;
  saveFooter: GradeOrderingSaveFooterProps;
}) {
  return (
    <MetricComparisonCard
      layout="card"
      data-card="card.metric.comparison-card.body-prose"
      className={GROUP_CARD_CLASS_NAME}
      title={<span className="text-sm font-semibold">{group.label}</span>}
      body={
        <div className="space-y-4">
          <TypographyFinePrint className="text-muted-foreground">
            Drag grades to reorder within this group only.
          </TypographyFinePrint>
          <SortableGradeList
            group={group}
            gradeLookup={gradeLookup}
            onReorder={onReorder}
            {...(disabled !== undefined ? { disabled } : {})}
          />
        </div>
      }
      footer={<GradeOrderingSaveFooter {...saveFooter} />}
    />
  );
}
