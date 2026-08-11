export type ManageSponsorsHeaderCopy = {
  title: string;
  description: string;
};

export type ManageSponsorsHeaderProps = {
  accountId: string;
  readOnly?: boolean;
};

export type ManageSponsorsHeaderActionsProps = ManageSponsorsHeaderProps & {
  entityButtonLabel: string;
};
