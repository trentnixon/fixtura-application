import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg gap-4 py-12 text-center">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-sm">The page you are looking for does not exist.</p>
      <div className="flex items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
