import Link from "next/link";

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
 * Placeholder: CMS create-organisation API not documented yet (.comms TBC).
 */
export default function CreateOrganisationPage() {
  return (
    <div className="mx-auto grid w-full max-w-lg gap-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Create organisation</CardTitle>
          <CardDescription>
            Self-serve organisation creation is not available in the app yet. The CMS contract for
            this flow is still to be confirmed.
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
