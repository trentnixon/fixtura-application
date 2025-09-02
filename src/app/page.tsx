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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/components">Open Components Showcase</Link>
        </Button>
      </div>

      <section className="grid gap-2 rounded-xl border p-4">
        <h2 className="font-brand text-base font-semibold">Brand tokens</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="bg-brand size-4 rounded-full" /> brand
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="bg-primary size-4 rounded-full" /> primary
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="bg-secondary size-4 rounded-full" /> secondary
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="bg-accent size-4 rounded-full" /> accent
          </span>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="icon button">
          ★
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Card One</CardTitle>
            <CardDescription>Basic shadcn card</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Use this to verify styling tokens and spacing.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Two</CardTitle>
            <CardDescription>Another example</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Outline
              </Button>
              <Button variant="ghost" size="sm">
                Ghost
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
          </CardFooter>
        </Card>
        <ErrorState />
        <EmptyState action={<Button size="sm">Create item</Button>} />
      </div>
    </div>
  );
}
