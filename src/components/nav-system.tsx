"use client";

import { IconActivity, IconChevronRight, IconServer, IconTools } from "@tabler/icons-react";
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/config/routes";

export function NavSystem() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const isActive = pathname.startsWith("/admin/system");

  const tools = [
    {
      title: "Inspector",
      url: ROUTES.systemInspector,
      icon: IconServer,
    },
    {
      title: "Fetch Health",
      url: ROUTES.fetchHealth,
      icon: IconActivity,
    },
  ];

  return (
    <SidebarMenu>
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
                <span className="truncate font-semibold">System</span>
                <span className="text-muted-foreground truncate text-xs italic">Admin Tools</span>
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
              Infrastructure
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tools.map((tool) => (
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
                href={ROUTES.systemLanding}
                className="text-primary flex cursor-pointer items-center gap-2 font-medium"
              >
                <IconTools className="size-4" />
                <span>System Overview</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
