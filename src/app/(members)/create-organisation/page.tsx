import Link from "next/link";

import { TypographyCardDescription, TypographyCardTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/config/routes";

/**
 * Placeholder until Strapi documents a create-organisation API for this app.
 * Product pattern: `.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md` (gateway + implementation table).
 * Replace this page with the real flow when the CMS contract is available (no API in repo yet).
 */
export default function CreateOrganisationPage() {
  return (
    <div className="mx-auto grid w-full max-w-lg gap-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <TypographyCardTitle as="span">Create organisation</TypographyCardTitle>
          </CardTitle>
          <CardDescription>
            <TypographyCardDescription as="span">
              Self-serve organisation creation is not wired up yet. The server contract for creating
              an organisation from the members app is still to be confirmed with the CMS team.
            </TypographyCardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <p>
            For now, use <strong>Select organisation</strong> if you already have access, or contact
            support to provision a new organisation.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild variant="default">
            <Link href={ROUTES.selectOrganisation}>Back to selection</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.help}>Get help</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
