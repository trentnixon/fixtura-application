"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PageHeader, Surface } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LAB_BRANDING_ORG_LABEL } from "@/features/route-lab/fixtures/branding";
import {
  type WeekdayKey,
  WEEKDAY_OPTIONS,
  daysUntilNextDelivery,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";
import { cn } from "@/lib/utils";

export type SettingsLabWorkspaceProps = {
  mode: "view" | "edit";
  scenarioKey: string;
  stubSaving: boolean;
};

type SettingsDraft = {
  organisationType: OrganisationTypeKey;
  bundleDeliveryDay: WeekdayKey;
  includeJuniorSurnamesInBundles: boolean;
  competitionsGroupedBy: CompetitionGroupingKey;
  splitSeniorsAndMasters: boolean;
};

const SAVED_SETTINGS: SettingsDraft = {
  organisationType: "club",
  bundleDeliveryDay: "sunday",
  includeJuniorSurnamesInBundles: false,
  competitionsGroupedBy: "competition",
  splitSeniorsAndMasters: false,
};

function equalDraft(a: SettingsDraft, b: SettingsDraft): boolean {
  return (
    a.organisationType === b.organisationType &&
    a.bundleDeliveryDay === b.bundleDeliveryDay &&
    a.includeJuniorSurnamesInBundles === b.includeJuniorSurnamesInBundles &&
    a.competitionsGroupedBy === b.competitionsGroupedBy &&
    a.splitSeniorsAndMasters === b.splitSeniorsAndMasters
  );
}

function settingId(key: keyof SettingsDraft) {
  return `route-lab-settings-${key}`;
}

function SettingsToggleRow(props: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  id: string;
  onCheckedChange: (next: boolean) => void;
}) {
  const { title, description, checked, disabled, id, onCheckedChange } = props;

  return (
    <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(Boolean(next))}
        className="shrink-0"
      />
    </li>
  );
}

function SettingsSelectRow(props: {
  title: string;
  description: string;
  disabled: boolean;
  id: string;
  valueLabel: string;
  children: ReactNode;
}) {
  const { title, description, disabled, id, valueLabel, children } = props;

  return (
    <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <TypographyMuted className="hidden text-xs sm:block">{valueLabel}</TypographyMuted>
        <div className={cn("min-w-40", disabled ? "opacity-70" : "opacity-100")}>{children}</div>
      </div>
      <span id={id} className="sr-only" />
    </li>
  );
}

type OrganisationTypeKey = "club" | "association";

type CompetitionGroupingKey = "competition" | "grade";

export function SettingsLabWorkspace({ mode, scenarioKey, stubSaving }: SettingsLabWorkspaceProps) {
  const interactive = mode === "edit";

  const initialDraft = useMemo<SettingsDraft>(() => {
    return SAVED_SETTINGS;
  }, []);

  const [draft, setDraft] = useState<SettingsDraft>(initialDraft);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    setDraft(initialDraft);
    setConfirmedAt(null);
    setSaveDialogOpen(false);
  }, [initialDraft, scenarioKey, mode]);

  const hasChanges = !equalDraft(draft, SAVED_SETTINGS);
  const saveDisabled = !interactive || stubSaving || !hasChanges;

  const showCompetitionsGroupedBy = draft.organisationType === "association";
  const showSplitSeniorsAndMasters = draft.organisationType === "club";

  function handleStubSave() {
    const stamp = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    toast.success("Route lab: save not sent", {
      description: `No API request ran. (${stamp})`,
    });
    setConfirmedAt(stamp);
    setSaveDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Settings — ${LAB_BRANDING_ORG_LABEL}`}
        description="Route lab: settings focused on booleans and simple select preferences. Use view/edit to model read-only vs interactive states."
      />

      <div className="space-y-6">
        <Surface className="overflow-hidden p-0">
          <div className="bg-primary-950 w-full border-b border-white/15 px-6 py-5 text-white">
            <p className="text-xl leading-none font-semibold text-white">Settings</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Manage delivery and bundle preferences for your organisation.
            </p>
          </div>
          <div className="px-0 pb-0">
            <ul>
              <SettingsSelectRow
                id={settingId("organisationType")}
                title="Organisation type (lab)"
                description="Controls which org-type-specific settings appear."
                disabled={!interactive}
                valueLabel={draft.organisationType === "association" ? "Association" : "Club"}
              >
                <Select
                  value={draft.organisationType}
                  onValueChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      organisationType: next as OrganisationTypeKey,
                    }))
                  }
                  disabled={!interactive}
                >
                  <SelectTrigger className="h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="association">Association</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsSelectRow>

              <SettingsSelectRow
                id={settingId("bundleDeliveryDay")}
                title="Bundle delivery day"
                description={`Weekly bundles deliver on this day. Next delivery in ${daysUntilNextDelivery(
                  draft.bundleDeliveryDay,
                )} days.`}
                disabled={!interactive}
                valueLabel={weekdayLabel(draft.bundleDeliveryDay)}
              >
                <Select
                  value={draft.bundleDeliveryDay}
                  onValueChange={(next) =>
                    setDraft((prev) => ({ ...prev, bundleDeliveryDay: next as WeekdayKey }))
                  }
                  disabled={!interactive}
                >
                  <SelectTrigger className="h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_OPTIONS.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsSelectRow>

              {showCompetitionsGroupedBy ? (
                <SettingsSelectRow
                  id={settingId("competitionsGroupedBy")}
                  title="Competitions grouped by"
                  description="Association setting — group lists by competition or by grade."
                  disabled={!interactive}
                  valueLabel={draft.competitionsGroupedBy === "grade" ? "Grade" : "Competition"}
                >
                  <Select
                    value={draft.competitionsGroupedBy}
                    onValueChange={(next) =>
                      setDraft((prev) => ({
                        ...prev,
                        competitionsGroupedBy: next as CompetitionGroupingKey,
                      }))
                    }
                    disabled={!interactive}
                  >
                    <SelectTrigger className="h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="grade">Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsSelectRow>
              ) : null}

              <SettingsToggleRow
                id={settingId("includeJuniorSurnamesInBundles")}
                title="Include junior players’ surnames in bundles?"
                description="When enabled, junior player surnames will appear in generated weekly bundles."
                checked={draft.includeJuniorSurnamesInBundles}
                disabled={!interactive}
                onCheckedChange={(next) =>
                  setDraft((prev) => ({ ...prev, includeJuniorSurnamesInBundles: next }))
                }
              />
              {showSplitSeniorsAndMasters ? (
                <SettingsToggleRow
                  id={settingId("splitSeniorsAndMasters")}
                  title="Split seniors and masters"
                  description="Club setting — when enabled, seniors and masters are delivered as separate bundle groups."
                  checked={draft.splitSeniorsAndMasters}
                  disabled={!interactive}
                  onCheckedChange={(next) =>
                    setDraft((prev) => ({ ...prev, splitSeniorsAndMasters: next }))
                  }
                />
              ) : null}
            </ul>
          </div>
          <div className="border-t px-6 py-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <TypographyMuted className="text-xs">
                {interactive
                  ? hasChanges
                    ? "You have unsaved changes."
                    : "No changes yet."
                  : "View mode — settings are read-only."}
              </TypographyMuted>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!interactive || stubSaving}
                  onClick={() => setDraft(SAVED_SETTINGS)}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  disabled={saveDisabled}
                  onClick={() => setSaveDialogOpen(true)}
                >
                  {stubSaving ? "Saving…" : "Save settings"}
                </Button>
              </div>
            </div>
          </div>
        </Surface>
      </div>

      {confirmedAt ? (
        <p className="text-muted-foreground text-xs">
          Confirmed at {confirmedAt}. Route lab — no server save ran.
        </p>
      ) : null}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save settings?</DialogTitle>
            <DialogDescription>
              Confirm the settings you want to keep. In Route Lab no server save runs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-border space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Settings
              </p>
              <ul className="text-foreground space-y-1 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Organisation type</span>
                  <span className="font-medium">
                    {draft.organisationType === "association" ? "Association" : "Club"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Preferred delivery day</span>
                  <span className="font-medium">{weekdayLabel(draft.bundleDeliveryDay)}</span>
                </li>
                {showCompetitionsGroupedBy ? (
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Competitions grouped by</span>
                    <span className="font-medium">
                      {draft.competitionsGroupedBy === "grade" ? "Grade" : "Competition"}
                    </span>
                  </li>
                ) : null}
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Include junior surnames</span>
                  <span className="font-medium">
                    {draft.includeJuniorSurnamesInBundles ? "Enabled" : "Disabled"}
                  </span>
                </li>
                {showSplitSeniorsAndMasters ? (
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Split seniors and masters</span>
                    <span className="font-medium">
                      {draft.splitSeniorsAndMasters ? "Enabled" : "Disabled"}
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Route Lab only — connect your API persistence when shipping to production.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saveDisabled} onClick={handleStubSave}>
              Confirm (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
