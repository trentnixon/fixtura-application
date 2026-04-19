"use client";

import {
  type Icon,
  IconBolt,
  IconChevronRight,
  IconDatabase,
  IconLayoutGrid,
  IconRoute,
} from "@tabler/icons-react";
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
import { ROUTES } from "@/lib/config/routes";
import { SANDBOX_PORTAL_LINKS } from "@/lib/dev-sandbox-nav";

const SANDBOX_LINK_ICONS: Record<string, Icon> = {
  [ROUTES.routeLab]: IconRoute,
  [ROUTES.kitchenSink]: IconLayoutGrid,
  [ROUTES.interactionLab]: IconBolt,
  [ROUTES.dataLab]: IconDatabase,
};

/** Sandbox dev tools dropdown — same interaction pattern as `NavSystemMenuItem`. */
export function NavSandboxMenuItem() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const isActive = pathname.startsWith(ROUTES.sandbox);

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
              <IconLayoutGrid className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Sandbox</span>
              <span className="text-muted-foreground truncate text-xs italic">Dev tools</span>
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
            Labs
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SANDBOX_PORTAL_LINKS.map((item) => {
            const Icon = SANDBOX_LINK_ICONS[item.href] ?? IconLayoutGrid;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Icon className="text-muted-foreground size-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={ROUTES.sandbox}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex cursor-pointer items-center gap-2 font-medium"
            >
              <IconLayoutGrid className="size-4" />
              <span>Sandbox portal</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
