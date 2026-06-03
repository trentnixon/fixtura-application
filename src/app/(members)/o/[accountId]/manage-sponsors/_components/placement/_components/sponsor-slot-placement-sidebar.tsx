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
  SPONSOR_SLOT_ASSIGNMENT_ROW_FILTER_OPTIONS,
  SPONSOR_SLOT_KIND_FILTER_OPTIONS,
} from "../_constants/sponsor-slot-placement-panel";
import { buildAddGeneralPositionLabel } from "../_utils/sponsor-slot-placement-panel";

import type {
  AssignmentRowFilter,
  SlotKindFilter,
  SponsorSlotPlacementSidebarProps,
} from "../_types/sponsor-slot-placement-panel";

export function SponsorSlotPlacementSidebar({
  metrics,
  mutationState,
  clearAllDialogOpen,
  sponsorSearchQuery,
  assignmentRowFilter,
  slotKindFilter,
  canAddGeneralRow,
  generalPositionSlotsRemaining,
  setSponsorSearchQuery,
  setAssignmentRowFilter,
  setSlotKindFilter,
  onAddGeneralRow,
  onClearAll,
}: SponsorSlotPlacementSidebarProps) {
  const clearAllDisabled =
    metrics.filled === 0 ||
    mutationState.isPending ||
    mutationState.busySlotId !== null ||
    clearAllDialogOpen ||
    mutationState.isClearingAll;

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
      <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-2xl border-none shadow-xl ring-1">
        <div className="bg-muted flex flex-col gap-2.5 px-3 py-2.5">
          <SponsorPlacementMetricGroup
            title="Position slots"
            metrics={[
              { label: "Filled", value: metrics.filled, suffix: ` / ${metrics.total}` },
              { label: "Empty", value: metrics.empty },
            ]}
          />
          <SponsorPlacementMetricGroup
            title="Sponsors"
            metrics={[
              { label: "Available sponsors", value: metrics.eligibleCount },
              { label: "Unassigned", value: metrics.unassigned },
            ]}
          />
          {canAddGeneralRow ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="brand"
                size="sm"
                className="h-9 w-full"
                disabled={mutationState.isClearingAll}
                onClick={onAddGeneralRow}
                aria-label={`Add general position (${generalPositionSlotsRemaining} slot${generalPositionSlotsRemaining === 1 ? "" : "s"} left)`}
              >
                {buildAddGeneralPositionLabel(generalPositionSlotsRemaining)}
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col gap-3 px-5 pt-4 pb-4">
          <Input
            type="search"
            value={sponsorSearchQuery}
            onChange={(event) => setSponsorSearchQuery(event.target.value)}
            placeholder="Search by sponsor name..."
            aria-label="Filter positions by assigned sponsor name"
            className="h-9 w-full md:text-sm"
          />
          <Select
            value={assignmentRowFilter}
            onValueChange={(value) => setAssignmentRowFilter(value as AssignmentRowFilter)}
          >
            <SelectTrigger className="h-9 w-full" aria-label="Filter positions by assignment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPONSOR_SLOT_ASSIGNMENT_ROW_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={slotKindFilter}
            onValueChange={(value) => setSlotKindFilter(value as SlotKindFilter)}
          >
            <SelectTrigger className="h-9 w-full" aria-label="Filter positions by slot type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPONSOR_SLOT_KIND_FILTER_OPTIONS.map((option) => (
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
