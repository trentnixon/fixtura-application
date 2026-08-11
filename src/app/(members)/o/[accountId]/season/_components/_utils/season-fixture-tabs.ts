import {
  SEASON_FIXTURE_DETAIL_TAB_LABELS,
  type SeasonFixtureDetailTabValue,
} from "../_constants/season-fixture-tabs";

import type { SeasonFixtureViewModel } from "../_types";

export function isFixtureScorecardTabVisible(model: SeasonFixtureViewModel): boolean {
  return model.hasScorecardTables;
}

export function isFixtureOutputsTabVisible(model: SeasonFixtureViewModel): boolean {
  return model.hasOutputs || model.contextMetaRows.length > 0 || Boolean(model.contentNote);
}

export function getVisibleFixtureDetailTabs(
  model: SeasonFixtureViewModel,
): SeasonFixtureDetailTabValue[] {
  const tabs: SeasonFixtureDetailTabValue[] = ["match"];

  if (isFixtureScorecardTabVisible(model)) {
    tabs.push("scorecard");
  }

  tabs.push("teams");

  if (isFixtureOutputsTabVisible(model)) {
    tabs.push("outputs");
  }

  return tabs;
}

export function resolveFixtureDetailDefaultTab(): SeasonFixtureDetailTabValue {
  return "match";
}

export function resolveFixtureDetailActiveTab(
  requested: string | undefined,
  visible: readonly SeasonFixtureDetailTabValue[],
): SeasonFixtureDetailTabValue {
  if (requested && visible.includes(requested as SeasonFixtureDetailTabValue)) {
    return requested as SeasonFixtureDetailTabValue;
  }

  return visible[0] ?? "match";
}

export function formatFixtureTabLabel(
  tab: SeasonFixtureDetailTabValue,
  model: SeasonFixtureViewModel,
): string {
  const base = SEASON_FIXTURE_DETAIL_TAB_LABELS[tab];

  if (tab === "teams" && model.teamSides) {
    const count = model.teamSides.home.playerLines.length + model.teamSides.away.playerLines.length;
    if (count > 0) {
      return `${base} (${count})`;
    }
  }

  if (tab === "outputs" && model.hasOutputs) {
    const count = model.downloadEntries.length;
    if (count > 0) {
      return `${base} (${count})`;
    }
  }

  return base;
}

export function fixtureOutputsTabHasPanelContent(model: SeasonFixtureViewModel): boolean {
  return model.hasOutputs || model.contextMetaRows.length > 0 || Boolean(model.contentNote);
}
