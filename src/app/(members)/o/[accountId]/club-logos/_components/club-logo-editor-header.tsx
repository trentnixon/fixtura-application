import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export type ClubLogoEditorHeaderProps = {
  accountId: string;
  clubName: string;
};

export function ClubLogoEditorHeader({ accountId, clubName }: ClubLogoEditorHeaderProps) {
  return (
    <PageHeader
      title={clubName}
      description="Upload, crop, and save this club’s logo. Changes apply to the club record, not your association branding."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="brandOutline" asChild>
            <Link href={accountScopedRoutes.clubLogos(accountId)}>
              <ArrowLeft aria-hidden />
              Back to club list
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
