"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUnsavedChangesContext } from "@/lib/navigation/unsaved-changes-context";

import { isNavItemActive } from "./_utils/is-nav-item-active";

import type { NavMainSection } from "./_types/nav-main";

export function NavMain({ sections }: { sections: NavMainSection[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirmIfDirty } = useUnsavedChangesContext();

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SidebarGroup key={section.label ?? `section-${sectionIndex}`}>
          {section.label ? <SidebarGroupLabel>{section.label}</SidebarGroupLabel> : null}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {section.items.map((item) => {
                const isActive = isNavItemActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={`${sectionIndex}-${item.url}`}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link
                        href={item.url}
                        onClick={(event) => {
                          if (isActive || item.url === pathname) return;
                          event.preventDefault();
                          confirmIfDirty(() => router.push(item.url));
                        }}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
