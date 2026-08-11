import type { NavUserProps } from "@/types/api/auth";

export type NavUserComponentProps = {
  user: NavUserProps;
  /** When set, Account links to scoped members account settings. */
  accountId?: string;
};
