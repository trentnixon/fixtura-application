import Link from "next/link";

import {
  TypographyH2,
  TypographyH3,
  TypographyH5,
  TypographyMuted,
  TypographyP,
} from "@/components/typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PageHeader, Section } from "@/components/ui/container";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/lib/config/routes";

export default function NavigationPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Navigation"
        description="Standardized components for application wayfinding, site structure, and hierarchy orientation."
      />

      <div className="space-y-16">
        {/* Navigation Menu */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Navigation Menu</TypographyH2>
            <TypographyMuted className="mt-1">
              Top-level navigation with popover content for complex site structures.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex min-h-[300px] justify-center rounded-xl border p-10">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-primary/50 to-primary flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                            href="/"
                          >
                            <TypographyH3 className="mt-4 mb-2 text-lg font-medium text-white">
                              Fixtura
                            </TypographyH3>
                            <TypographyP className="text-sm leading-tight text-white/90">
                              Beautifully designed components built with Radix UI and Tailwind CSS.
                            </TypographyP>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="/docs">
                          <TypographyH5 className="text-sm leading-none font-medium">
                            Introduction
                          </TypographyH5>
                          <TypographyMuted className="line-clamp-2 leading-snug">
                            Re-usable components built using Radix UI and Tailwind CSS.
                          </TypographyMuted>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="/docs/installation">
                          <TypographyH5 className="text-sm leading-none font-medium">
                            Installation
                          </TypographyH5>
                          <TypographyMuted className="line-clamp-2 leading-snug">
                            How to install dependencies and structure your app.
                          </TypographyMuted>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/docs">Documentation</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </Section>

        {/* Menubar */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Menubar</TypographyH2>
            <TypographyMuted className="mt-1">
              A desktop-style horizontal menu bar, perfect for application-heavy interfaces.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 flex justify-center rounded-xl border p-10">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    New Window <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Share</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Print</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Undo</MenubarItem>
                  <MenubarItem>Redo</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem inset>Reload</MenubarItem>
                  <MenubarItem inset disabled>
                    Force Reload
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </Section>

        {/* Breadcrumb */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-xl font-semibold">Breadcrumb</TypographyH2>
            <TypographyMuted className="mt-1">
              Components to display the current page hierarchy and enable easy back-navigation.
            </TypographyMuted>
          </div>
          <div className="bg-card/50 rounded-xl border p-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={ROUTES.kitchenSink}>Kitchen Sink</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Navigation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </Section>
      </div>
    </div>
  );
}
