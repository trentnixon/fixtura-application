import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { SponsorPlacementMetricGroup } from "./sponsor-placement-metric-group";
import {
  SPONSOR_ENTITY_ROW_FILTER_OPTIONS,
  SPONSOR_ENTITY_TYPE_FILTER_OPTIONS,
} from "../_constants/sponsor-entity-assignment-panel";

import type {
  EntityRowFilter,
  EntityTypeFilter,
  SponsorEntityAssignmentSidebarProps,
} from "../_types/sponsor-entity-assignment-panel";

export function SponsorEntityAssignmentSidebar({
  metrics,
  mutationState,
  clearAllDialogOpen,
  entitySearchQuery,
  entityRowFilter,
  entityTypeFilter,
  setEntitySearchQuery,
  setEntityRowFilter,
  setEntityTypeFilter,
  onClearAll,
}: SponsorEntityAssignmentSidebarProps) {
  const clearAllDisabled =
    metrics.totalAllocations === 0 ||
    mutationState.isPending ||
    mutationState.busyTargetKey !== null ||
    clearAllDialogOpen ||
    mutationState.isClearingAll;

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
      <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-2xl border-none shadow-xl ring-1">
        <div className="bg-muted flex flex-col gap-2.5 px-3 py-2.5">
          <SponsorPlacementMetricGroup
            title="Entity targets"
            metrics={[
              {
                label: "Targeted",
                value: metrics.assignedTargets,
                suffix: ` / ${metrics.totalTargets}`,
              },
              { label: "Empty", value: metrics.emptyTargets },
            ]}
          />
          <SponsorPlacementMetricGroup
            title="Sponsors"
            metrics={[
              { label: "Available sponsors", value: metrics.eligibleCount },
              { label: "Unassigned", value: metrics.unassigned },
            ]}
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-3 px-5 pt-4 pb-4">
          <Input
            type="search"
            value={entitySearchQuery}
            onChange={(event) => setEntitySearchQuery(event.target.value)}
            placeholder="Search clubs, teams, or grades..."
            aria-label="Filter entities by name"
            className="h-9 w-full md:text-sm"
          />
          <Select
            value={entityRowFilter}
            onValueChange={(value) => setEntityRowFilter(value as EntityRowFilter)}
          >
            <SelectTrigger className="h-9 w-full" aria-label="Filter entities by assignment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPONSOR_ENTITY_ROW_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={entityTypeFilter}
            onValueChange={(value) => setEntityTypeFilter(value as EntityTypeFilter)}
          >
            <SelectTrigger className="h-9 w-full" aria-label="Filter entities by type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPONSOR_ENTITY_TYPE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="bg-muted/25 px-5 pt-0 pb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-9 w-full"
            disabled={clearAllDisabled}
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
}
