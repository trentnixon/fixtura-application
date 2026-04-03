"use client";

import { IconActivity, IconChevronRight, IconServer, IconTools } from "@tabler/icons-react";
import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/config/routes";

export default function AdminSystemLandingPage() {
  const tools = [
    {
      title: "System Inspector",
      description:
        "Inspect API endpoints, view TanStack Query cache state, and manually trigger fetches for debugging.",
      href: ROUTES.systemInspector,
      icon: IconServer,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Fetch Health",
      description:
        "Monitor the health and performance of background synchronization and data fetching services.",
      href: ROUTES.fetchHealth,
      icon: IconActivity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <IconTools className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Tools</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Diagnostic and monitoring tools for the Fixtura platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className="group-hover:border-primary/50 h-full transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 py-8">
                <div
                  className={`rounded-xl p-3 ${tool.bgColor} ${tool.color} group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}
                >
                  <tool.icon className="h-8 w-8" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <CardTitle className="group-hover:text-primary text-xl transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </div>
                <IconChevronRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-muted/30 mt-8 rounded-2xl border border-dashed p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="flex-1 space-y-2">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Admin Notice
            </h3>
            <p className="text-muted-foreground text-sm">
              These tools are designed for infrastructure debugging and should be used with caution
              in production. Always verify state changes in the data layer after manual
              interventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
