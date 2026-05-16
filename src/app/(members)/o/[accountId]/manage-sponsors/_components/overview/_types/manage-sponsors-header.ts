export type ManageSponsorsHeaderCopy = {
  title: string;
  description: string;
};

export type ManageSponsorsHeaderProps = {
  accountId: string;
};

export type ManageSponsorsHeaderActionsProps = ManageSponsorsHeaderProps & {
  entityButtonLabel: string;
};
