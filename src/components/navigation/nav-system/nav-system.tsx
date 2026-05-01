"use client";

import { IconChevronRight, IconTools } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

import {
  NAV_SYSTEM_INFRASTRUCTURE_TOOLS,
  NAV_SYSTEM_OVERVIEW_PATH,
  NAV_SYSTEM_OVERVIEW_TITLE,
  NAV_SYSTEM_SECTION_INFRASTRUCTURE,
  NAV_SYSTEM_TRIGGER_SUBTITLE,
  NAV_SYSTEM_TRIGGER_TITLE,
} from "./_constants/nav-system-ui";
import { isSystemNavActive } from "./_utils/is-system-nav-active";

/** System admin tools dropdown — use inside a parent `SidebarMenu` (e.g. under an Admin group). */
export function NavSystemMenuItem() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const isActive = isSystemNavActive(pathname);

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            isActive={isActive}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-primary text-primary-foreground group-hover:bg-primary/90 flex aspect-square size-8 items-center justify-center rounded-lg transition-colors">
              <IconTools className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{NAV_SYSTEM_TRIGGER_TITLE}</span>
              <span className="text-muted-foreground truncate text-xs italic">
                {NAV_SYSTEM_TRIGGER_SUBTITLE}
              </span>
            </div>
            <IconChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-muted-foreground/70 px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
            {NAV_SYSTEM_SECTION_INFRASTRUCTURE}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NAV_SYSTEM_INFRASTRUCTURE_TOOLS.map((tool) => (
            <DropdownMenuItem key={tool.url} asChild>
              <Link href={tool.url} className="flex cursor-pointer items-center gap-2">
                <tool.icon className="text-muted-foreground size-4" />
                <span>{tool.title}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={NAV_SYSTEM_OVERVIEW_PATH}
              className="text-primary flex cursor-pointer items-center gap-2 font-medium"
            >
              <IconTools className="size-4" />
              <span>{NAV_SYSTEM_OVERVIEW_TITLE}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
