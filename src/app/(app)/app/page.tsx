import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AppRootPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-xl font-semibold">Members area</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Protected shell overview. Use the sidebar to open placeholder routes.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/app/home">Go to Home</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/account">Account placeholder</Link>
        </Button>
      </div>
    </div>
  );
}
