"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";

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
import { useLogout } from "@/lib/api/hooks/auth/useLogout";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import type { NavUserProps } from "@/types/api/auth";
import type { MouseEvent } from "react";

export function NavUser({
  user,
  accountId,
}: {
  user: NavUserProps;
  /** When set, Account links to scoped members account settings. */
  accountId?: string;
}) {
  const { isMobile } = useSidebar();
  const logout = useLogout();
  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "FX";

  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    if (logout.isPending) return;

    try {
      await logout.mutateAsync();
      toast.success(AUTH_ERROR_MESSAGES.loggedOut);
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.unexpected);
    }
  };

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
                <Link
                  href={
                    accountId ? accountScopedRoutes.account(accountId) : ROUTES.selectOrganisation
                  }
                >
                  <IconUserCircle />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    accountId ? accountScopedRoutes.billing(accountId) : ROUTES.selectOrganisation
                  }
                >
                  <IconCreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications">
                  <IconNotification />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logout.isPending} onClick={handleLogout}>
              <IconLogout />
              {logout.isPending ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
