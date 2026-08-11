export type AssignSponsorsMode = "position" | "entity";

export type AssignSponsorsHeaderCopy = {
  title: string;
  description: string;
};

export type AssignSponsorsHeaderProps = {
  accountId: string;
  mode: AssignSponsorsMode;
};

export type AssignSponsorsHeaderActionsProps = AssignSponsorsHeaderProps & {
  entityButtonLabel: string;
};
