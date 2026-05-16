export type AccountPageParams = Promise<{ accountId: string }>;

export type AccountPageProps = {
  params: AccountPageParams;
};

export type AccountPageContentProps = {
  accountId: string;
};
