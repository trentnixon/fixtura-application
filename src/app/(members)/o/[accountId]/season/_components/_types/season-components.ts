import type { ReactNode } from "react";

export type SeasonCompetitionDetailProps = {
  accountId: string;
  competitionId: string;
};

export type SeasonGradeViewProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
};

export type SeasonFixtureViewProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
  fixtureId: string;
};

export type SeasonOnboardingShellProps = {
  accountId: string;
  children: ReactNode;
};

export type SeasonEmptyPanelAction = {
  label: string;
  href: string;
};

export type SeasonEmptyPanelProps = {
  title: string;
  description: string;
  action?: SeasonEmptyPanelAction;
  footer?: ReactNode;
};

export type UnknownRecord = Record<string, unknown>;
