import * as React from "react";

export function SidebarLayout({
  sidebar,
  main,
  ...props
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
} & React.ComponentProps<"div">) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[240px_1fr]" {...props}>
      <aside className="rounded-lg border p-3 text-sm">{sidebar}</aside>
      <main className="rounded-lg border p-3 text-sm">{main}</main>
    </div>
  );
}
