"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Basic */}
      <Card>
        <CardHeader>
          <CardTitle>Basic card</CardTitle>
          <CardDescription>Simple card layout</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Card content area</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>

      {/* With actions */}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>With actions</CardTitle>
            <CardDescription>Header actions on the right</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Secondary
            </Button>
            <Button size="sm">Primary</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Use actions for common tasks.</p>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Card with media</CardTitle>
          <CardDescription>Image in content area</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="overflow-hidden rounded-md border">
            <Image src="/next.svg" alt="media" width={300} height={80} />
          </div>
          <p className="text-muted-foreground text-sm">Media caption or description.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">View</Button>
        </CardFooter>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Card with list</CardTitle>
          <CardDescription>Items within content</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 text-sm">
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
