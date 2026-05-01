"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";

import { TypographyCaption, TypographyNavLabel } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  NAV_USER_MENU_LABEL_ACCOUNT,
  NAV_USER_MENU_LABEL_BILLING,
  NAV_USER_MENU_LABEL_LOGGING_OUT,
  NAV_USER_MENU_LABEL_LOGOUT,
  NAV_USER_MENU_LABEL_NOTIFICATIONS,
  NAV_USER_NOTIFICATIONS_HREF,
} from "./_constants/nav-user-ui";
import { useNavUserLogout } from "./_hooks/use-nav-user-logout";
import { getNavUserInitials } from "./_utils/get-nav-user-initials";
import {
  resolveNavUserAccountHref,
  resolveNavUserBillingHref,
} from "./_utils/resolve-nav-user-menu-hrefs";

import type { NavUserComponentProps } from "./_types/nav-user";

export function NavUser({ user, accountId }: NavUserComponentProps) {
  const { isMobile } = useSidebar();
  const { logout, handleLogout } = useNavUserLogout();
  const initials = getNavUserInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <TypographyNavLabel as="span" className="truncate">
                  {user.name}
                </TypographyNavLabel>
                <TypographyCaption as="span" className="truncate">
                  {user.email}
                </TypographyCaption>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <TypographyNavLabel as="span" className="truncate">
                    {user.name}
                  </TypographyNavLabel>
                  <TypographyCaption as="span" className="truncate">
                    {user.email}
                  </TypographyCaption>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={resolveNavUserAccountHref(accountId)}>
                  <IconUserCircle />
                  {NAV_USER_MENU_LABEL_ACCOUNT}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={resolveNavUserBillingHref(accountId)}>
                  <IconCreditCard />
                  {NAV_USER_MENU_LABEL_BILLING}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={NAV_USER_NOTIFICATIONS_HREF}>
                  <IconNotification />
                  {NAV_USER_MENU_LABEL_NOTIFICATIONS}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logout.isPending} onClick={handleLogout}>
              <IconLogout />
              {logout.isPending ? NAV_USER_MENU_LABEL_LOGGING_OUT : NAV_USER_MENU_LABEL_LOGOUT}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
