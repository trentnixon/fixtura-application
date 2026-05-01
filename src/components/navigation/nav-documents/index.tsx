"use client";

import { IconDots } from "@tabler/icons-react";

import { NavDocumentsMenuItem } from "@/components/navigation/nav-documents/_components/nav-documents-menu-item";
import { NAV_DOCUMENTS_LABEL } from "@/components/navigation/nav-documents/_constants/nav-documents-ui";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { NavDocumentsProps } from "@/components/navigation/nav-documents/_types/nav-documents";

export function NavDocuments({ items }: NavDocumentsProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{NAV_DOCUMENTS_LABEL}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavDocumentsMenuItem key={item.name} item={item} />
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export type {
  NavDocumentItem,
  NavDocumentsProps,
} from "@/components/navigation/nav-documents/_types/nav-documents";
