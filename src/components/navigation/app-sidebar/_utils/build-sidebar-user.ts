import type {
  AccountOrganisationContextData,
  AccountOrganisationDetails,
  AccountSummary,
} from "@/types/api/account";
import type { NavUserProps } from "@/types/api/auth";

const fallbackUser: NavUserProps = {
  name: "Member",
  email: "member@fixtura.com.au",
  avatar: "/avatars/shadcn.jpg",
};

export function buildAppSidebarUser(params: {
  navMode: "gateway" | "scoped";
  bootstrapRow: AccountSummary | undefined;
  bootstrapOrg: AccountOrganisationDetails | undefined;
  sessionEmail: string | undefined;
  orgContextData: AccountOrganisationContextData | undefined;
}): NavUserProps {
  const { navMode, bootstrapRow, bootstrapOrg, sessionEmail, orgContextData } = params;

  const meUser: NavUserProps = {
    ...fallbackUser,
    name: bootstrapRow?.FirstName ?? fallbackUser.name,
    email: bootstrapOrg?.Name ?? sessionEmail ?? fallbackUser.email,
    avatar: bootstrapOrg?.ParentLogo ?? fallbackUser.avatar,
  };

  if (navMode === "scoped" && orgContextData) {
    return {
      ...meUser,
      email: orgContextData.accountOrganisationDetails?.Name ?? meUser.email,
      avatar: orgContextData.accountOrganisationDetails?.ParentLogo ?? meUser.avatar,
    };
  }

  return meUser;
}
