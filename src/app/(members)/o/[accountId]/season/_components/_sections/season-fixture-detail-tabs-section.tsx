"use client";

import { useEffect, useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  SEASON_FIXTURE_DETAIL_OUTPUTS_EMPTY_COPY,
  SEASON_FIXTURE_DETAIL_TABS_ARIA_LABEL,
  TABBER_PILL_BORDERLESS_DEFAULT_LIST_CLASS,
  TABBER_PILL_BORDERLESS_DEFAULT_TRIGGER_CLASS,
} from "../_constants";
import { SeasonFixtureContentNoteSection } from "./season-fixture-content-note-section";
import { SeasonFixtureContextMetaSection } from "./season-fixture-context-meta-section";
import { SeasonFixtureGradeContextSection } from "./season-fixture-grade-context-section";
import { SeasonFixtureMatchSummarySection } from "./season-fixture-match-summary-section";
import { SeasonFixtureOutputsSection } from "./season-fixture-outputs-section";
import { SeasonFixtureScorecardsSection } from "./season-fixture-scorecards-section";
import { SeasonFixtureTeamsSection } from "./season-fixture-teams-section";
import {
  fixtureOutputsTabHasPanelContent,
  formatFixtureTabLabel,
  getVisibleFixtureDetailTabs,
  resolveFixtureDetailActiveTab,
  resolveFixtureDetailDefaultTab,
} from "../_utils/season-fixture-tabs";

import type { SeasonFixtureDetailTabValue } from "../_constants/season-fixture-tabs";
import type { SeasonFixtureDetailTabsSectionProps } from "../_types";

export function SeasonFixtureDetailTabsSection({ model }: SeasonFixtureDetailTabsSectionProps) {
  const visibleTabs = useMemo(() => getVisibleFixtureDetailTabs(model), [model]);
  const defaultTab = resolveFixtureDetailDefaultTab();
  const [activeTab, setActiveTab] = useState<SeasonFixtureDetailTabValue>(defaultTab);

  useEffect(() => {
    setActiveTab((current) => resolveFixtureDetailActiveTab(current, visibleTabs));
  }, [visibleTabs]);

  const outputsHasContent = fixtureOutputsTabHasPanelContent(model);

  const handleTabChange = (value: string) => {
    setActiveTab(resolveFixtureDetailActiveTab(value, visibleTabs));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="grid w-full gap-6">
      <TabsList
        aria-label={SEASON_FIXTURE_DETAIL_TABS_ARIA_LABEL}
        className={TABBER_PILL_BORDERLESS_DEFAULT_LIST_CLASS}
      >
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={TABBER_PILL_BORDERLESS_DEFAULT_TRIGGER_CLASS}
          >
            {formatFixtureTabLabel(tab, model)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="match" className="mt-0 grid gap-6">
        <SeasonFixtureMatchSummarySection model={model} />
        <SeasonFixtureGradeContextSection model={model} />
      </TabsContent>

      {visibleTabs.includes("scorecard") ? (
        <TabsContent value="scorecard" className="mt-0">
          <SeasonFixtureScorecardsSection model={model} />
        </TabsContent>
      ) : null}

      <TabsContent value="teams" className="mt-0">
        <SeasonFixtureTeamsSection model={model} />
      </TabsContent>

      {visibleTabs.includes("outputs") ? (
        <TabsContent value="outputs" className="mt-0 grid gap-6">
          {outputsHasContent ? (
            <>
              <SeasonFixtureOutputsSection model={model} />
              <SeasonFixtureContextMetaSection model={model} />
              <SeasonFixtureContentNoteSection model={model} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              {SEASON_FIXTURE_DETAIL_OUTPUTS_EMPTY_COPY}
            </p>
          )}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
