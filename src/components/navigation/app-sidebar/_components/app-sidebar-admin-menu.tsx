"use client";

import { NavSandboxMenuItem } from "@/components/navigation/nav-sandbox";
import { NavSystemMenuItem } from "@/components/navigation/nav-system";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { isDevSandboxEnabled } from "@/lib/dev-sandbox";

export function AppSidebarAdminMenu() {
  if (!isDevSandboxEnabled) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <NavSandboxMenuItem />
          <NavSystemMenuItem />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
