"use client";

import Link from "next/link";

export function StatesPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link className="text-sm underline" href="/">
        See examples on home page
      </Link>
    </div>
  );
}
