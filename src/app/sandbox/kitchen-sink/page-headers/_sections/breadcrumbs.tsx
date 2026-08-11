import Link from "next/link";

import {
  TypographyH2,
  TypographyMuted,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Section } from "@/components/ui/container";
import { ROUTES } from "@/lib/config/routes";

import { PageHeaderReferenceName } from "../page-header-reference-name";

export function BreadcrumbsHeaderSection() {
  return (
    <Section spacing="none">
      <div className="mb-6">
        <TypographyH2 className="text-xl font-semibold">Breadcrumbs + title</TypographyH2>
        <TypographyMuted className="mt-1">
          Crumb trail above the page title for nested routes. Composes the existing{" "}
          <code className="text-xs">Breadcrumb</code> primitive.
        </TypographyMuted>
        <div className="mt-3">
          <PageHeaderReferenceName name="page.header.breadcrumbs" />
        </div>
      </div>
      <div className="bg-card/50 rounded-xl border p-6 sm:p-10">
        <header className="border-border border-b pb-8">
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.sandbox}>Sandbox</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.routeLab}>Route lab</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`${ROUTES.routeLab}/season/575/overview`}>Season · 575</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-2">
              <TypographyPageTitle
                as="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Season overview
              </TypographyPageTitle>
              <TypographyPageDescription className="max-w-3xl">
                Recon, stats, and competition summaries for this account. Match this stack on any
                nested members route where wayfinding matters.
              </TypographyPageDescription>
            </div>
          </div>
        </header>
      </div>
    </Section>
  );
}
