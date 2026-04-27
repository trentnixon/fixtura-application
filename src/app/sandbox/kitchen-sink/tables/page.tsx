"use client";

import {
  Search,
  Check,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  Copy,
  Download,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const auditData = [
  {
    id: "AUD-001",
    project: "Acme Corporate Site",
    date: "2026-03-12",
    status: "Completed",
    score: 94,
  },
  {
    id: "AUD-002",
    project: "Globex App Dashboard",
    date: "2026-03-15",
    status: "In Progress",
    score: null,
  },
  { id: "AUD-003", project: "Soylent Corp LP", date: "2026-03-18", status: "Failed", score: 42 },
  {
    id: "AUD-004",
    project: "Stark Industries v4",
    date: "2026-03-20",
    status: "Completed",
    score: 88,
  },
  {
    id: "AUD-005",
    project: "Wayne Ent. Portal",
    date: "2026-03-22",
    status: "Pending",
    score: null,
  },
];

const syncRows = [
  {
    service: "Stripe",
    state: "Connected",
    lastSynced: "8 min ago",
    nextRun: "10:45 AM",
    children: [
      ["Invoices", "Completed", "42 records"],
      ["Customers", "Completed", "18 records"],
      ["Webhook events", "Running", "6 queued"],
    ],
  },
  {
    service: "Mailchimp",
    state: "Warning",
    lastSynced: "2 hr ago",
    nextRun: "Paused",
    children: [
      ["Audience sync", "Warning", "Needs reconnect"],
      ["Campaign stats", "Queued", "Waiting"],
    ],
  },
];

const jobRows = [
  ["JOB-1042", "Fixture export", "Running", "Processing round data"],
  ["JOB-1041", "Asset render", "Pending", "Waiting for worker"],
  ["JOB-1040", "Webhook retry", "Failed", "Gateway timeout"],
];

function TableReferenceName({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyName() {
    if (!window.navigator.clipboard) return;
    await window.navigator.clipboard.writeText(name);
    setCopied(true);
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground font-medium">Reference</span>
      <div className="border-border bg-muted/40 text-foreground inline-flex min-w-0 items-center rounded-md border font-mono text-[11px] leading-none">
        <code className="min-w-0 truncate px-2 py-1">{name}</code>
        <button
          type="button"
          className="border-border/70 hover:bg-muted focus-visible:ring-ring/50 inline-flex size-6 shrink-0 items-center justify-center rounded-r-md border-l transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`Copy ${name}`}
          title={copied ? "Copied" : "Copy reference name"}
          onClick={copyName}
        >
          {copied ? (
            <Check className="text-success size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        status === "Completed"
          ? "bg-success/5 text-success border-success/10"
          : status === "In Progress"
            ? "bg-primary/5 text-primary border-primary/10"
            : status === "Failed"
              ? "bg-destructive/5 text-destructive border-destructive/10"
              : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

const selectedContainerFits = [
  {
    name: "container.block.flush.default",
    use: "Primary table shell where rows, headers, and footers provide the inner structure.",
  },
  {
    name: "container.strip.toolbar.default",
    use: "Search, filters, exports, and table-scoped controls above a data grid.",
  },
  {
    name: "container.block.subtle.default",
    use: "Low-emphasis planning, inventory, and implementation notes near the table catalog.",
  },
  {
    name: "container.state.empty.default",
    use: "Future empty, loading, error, and filtered-empty table states.",
  },
];

export default function TablesPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Table Visualization"
        description="Standardized patterns for displaying structured data, audit logs, and member lists with premium styling."
      />

      <div className="space-y-24">
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Selected Table Containers</TypographyH2>
            <TypographyMuted className="mt-1 max-w-3xl">
              Container-library options chosen for table patterns on this route. These keep table
              examples aligned with the container catalog while preserving table-specific structure.
            </TypographyMuted>
          </div>

          <div className="bg-muted/35 rounded-lg border border-transparent p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedContainerFits.map((container) => (
                <div key={container.name} className="bg-background rounded-lg border p-4">
                  <code className="bg-muted/60 text-foreground rounded-md px-2 py-1 font-mono text-[11px]">
                    {container.name}
                  </code>
                  <TypographyMuted className="mt-2 text-xs leading-relaxed">
                    {container.use}
                  </TypographyMuted>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Core Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Baseline table variants for read-only data, dense operations, review screens, long
              datasets, and clickable rows.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.standard.basic" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[120px]">Audit ID</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Run Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {row.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.standard.dense" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="h-8 w-[100px] text-[11px]">Audit ID</TableHead>
                      <TableHead className="h-8 text-[11px]">Project</TableHead>
                      <TableHead className="h-8 text-[11px]">Status</TableHead>
                      <TableHead className="h-8 text-right text-[11px]">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="py-2 font-mono text-[11px] font-semibold">
                          {row.id}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate py-2 text-xs font-medium">
                          {row.project}
                        </TableCell>
                        <TableCell className="py-2">
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="py-2 text-right text-xs tabular-nums">
                          {row.score ? `${row.score}%` : "Queued"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.standard.comfortable" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 3).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="py-5">
                          <div className="space-y-1">
                            <div className="font-medium">{row.project}</div>
                            <TypographyMuted className="font-mono text-xs">
                              {row.id}
                            </TypographyMuted>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="py-5 text-right font-semibold tabular-nums">
                          {row.score ? `${row.score}%` : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.standard.striped" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Audit ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Run Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.map((row) => (
                      <TableRow key={row.id} className="odd:bg-muted/25 hover:bg-muted/35">
                        <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {row.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.standard.hover" />
              <div className="bg-background max-w-4xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Open Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{row.project}</div>
                            <TypographyMuted className="font-mono text-xs">
                              {row.id}
                            </TypographyMuted>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-sm">
                          View audit
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Data Grids</TypographyH2>
            <TypographyMuted className="mt-1">
              Operational table shells with toolbars, sorting, selection, pagination, bulk actions,
              and column controls.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.grid.toolbar" />
              <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
                <div className="bg-muted/35 flex flex-col items-center justify-between gap-4 border-b px-4 py-3 sm:flex-row">
                  <div className="relative w-full sm:w-80">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input placeholder="Filter projects..." className="h-9 rounded-lg pl-10" />
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="mr-2 h-3.5 w-3.5" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <Download className="mr-2 h-3.5 w-3.5" /> Export
                    </Button>
                    <Button variant="brand" size="sm" className="h-9">
                      Run Audit
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.score ? `${row.score}%` : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.grid.sortable" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      {["ID", "Project", "Status"].map((label) => (
                        <TableHead key={label}>
                          <Button
                            variant="ghost"
                            className="-ml-2 h-8 px-2 text-xs font-bold uppercase hover:bg-transparent"
                          >
                            {label} <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.score ? `${row.score}%` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.grid.selectable" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[44px]">
                        <div className="border-muted-foreground/30 bg-primary flex size-4 items-center justify-center rounded border text-white">
                          <Check className="size-3" />
                        </div>
                      </TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row, index) => (
                      <TableRow key={row.id} className={index < 2 ? "bg-primary/5" : undefined}>
                        <TableCell>
                          <div
                            className={`border-muted-foreground/30 flex size-4 items-center justify-center rounded border ${
                              index < 2 ? "bg-primary text-white" : "bg-background"
                            }`}
                          >
                            {index < 2 ? <Check className="size-3" /> : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.grid.pagination" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Audit ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 3).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {row.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-muted/20 flex items-center justify-between border-t p-4">
                  <TypographyMuted className="text-xs">
                    Showing <strong>1-3</strong> of <strong>24</strong> results
                  </TypographyMuted>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 text-xs font-bold"
                      disabled
                    >
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-bold">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.grid.bulk-actions" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <div className="bg-primary/10 text-primary flex flex-wrap items-center justify-between gap-3 border-b p-3">
                  <span className="text-sm font-semibold">2 selected</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      Archive
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[44px]" />
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 3).map((row, index) => (
                      <TableRow key={row.id} className={index < 2 ? "bg-primary/5" : undefined}>
                        <TableCell>
                          <div
                            className={`border-muted-foreground/30 flex size-4 items-center justify-center rounded border ${
                              index < 2 ? "bg-primary text-white" : "bg-background"
                            }`}
                          >
                            {index < 2 ? <Check className="size-3" /> : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.grid.column-controls" />
              <div className="bg-background max-w-5xl overflow-hidden rounded-lg border">
                <div className="bg-muted/35 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                  <TypographyMuted className="text-xs font-semibold tracking-tight uppercase">
                    Columns: Project, Status, Score, Child rows
                  </TypographyMuted>
                  <Button variant="outline" size="sm">
                    Columns <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{auditData[0].project}</TableCell>
                      <TableCell>
                        <StatusPill status={auditData[0].status} />
                      </TableCell>
                      <TableCell className="text-right">{auditData[0].score}%</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="bg-muted/20 p-4">
                        <div className="bg-background rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead>Child check</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead className="text-right">Result</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[
                                ["Accessibility", "QA", "Passed"],
                                ["Performance", "Ops", "Review"],
                                ["SEO metadata", "Content", "Passed"],
                              ].map(([check, owner, result]) => (
                                <TableRow key={check}>
                                  <TableCell>{check}</TableCell>
                                  <TableCell>{owner}</TableCell>
                                  <TableCell className="text-right">{result}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Status Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Tables for audit trails, module health, progress, job queues, and integration sync
              state.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.status.audit-log" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>ID</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["LOG-941", "Fixture", "Published", "A. Chen", "09:42"],
                      ["LOG-940", "Team", "Updated", "M. Jones", "09:18"],
                      ["LOG-939", "Asset", "Archived", "System", "08:55"],
                    ].map(([id, entity, action, actor, time]) => (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs">{id}</TableCell>
                        <TableCell className="font-medium">{entity}</TableCell>
                        <TableCell>
                          {action}
                          <TypographyMuted className="text-xs">by {actor}</TypographyMuted>
                        </TableCell>
                        <TableCell className="text-right">{time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.status.health" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Module</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Renderer", "Completed", "122ms"],
                      ["Webhook", "In Progress", "410ms"],
                      ["Storage", "Failed", "Timeout"],
                    ].map(([module, state, latency]) => (
                      <TableRow key={module}>
                        <TableCell className="font-medium">{module}</TableCell>
                        <TableCell>
                          <StatusPill status={state} />
                        </TableCell>
                        <TableCell className="text-right">{latency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.status.progress" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Workflow</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Complete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Generate fixtures", 86],
                      ["Render social assets", 64],
                      ["Sync teams", 38],
                    ].map(([workflow, percent]) => (
                      <TableRow key={workflow}>
                        <TableCell className="font-medium">{workflow}</TableCell>
                        <TableCell>
                          <div className="bg-muted h-2 overflow-hidden rounded-full">
                            <div className="bg-primary h-full" style={{ width: `${percent}%` }} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {percent}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.status.queue" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Job</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobRows.map(([id, job, state, detail]) => (
                      <TableRow key={id}>
                        <TableCell>
                          <span className="font-medium">{job}</span>
                          <TypographyMuted className="font-mono text-xs">{id}</TypographyMuted>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={state === "Running" ? "In Progress" : state} />
                          <TypographyMuted className="text-xs">{detail}</TypographyMuted>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="h-8">
                            {state === "Failed" ? "Retry" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.status.sync" />
              <div className="bg-background max-w-5xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Integration</TableHead>
                      <TableHead>Connection</TableHead>
                      <TableHead>Last synced</TableHead>
                      <TableHead className="text-right">Next run</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncRows.map((row, index) => (
                      <Fragment key={row.service}>
                        <TableRow key={row.service}>
                          <TableCell className="font-medium">{row.service}</TableCell>
                          <TableCell>
                            <StatusPill
                              status={row.state === "Connected" ? "Completed" : "In Progress"}
                            />
                          </TableCell>
                          <TableCell>{row.lastSynced}</TableCell>
                          <TableCell className="text-right">{row.nextRun}</TableCell>
                        </TableRow>
                        {index === 0 ? (
                          <TableRow
                            key={`${row.service}-children`}
                            className="hover:bg-transparent"
                          >
                            <TableCell colSpan={4} className="bg-muted/20 p-4">
                              <div className="bg-background rounded-lg border">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/30">
                                      <TableHead>Child sync</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Volume</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {row.children.map(([child, status, volume]) => (
                                      <TableRow key={child}>
                                        <TableCell>{child}</TableCell>
                                        <TableCell>
                                          <StatusPill
                                            status={status === "Running" ? "In Progress" : status}
                                          />
                                        </TableCell>
                                        <TableCell className="text-right">{volume}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Entity Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Domain-shaped tables for members, teams, fixtures, assets, and billing records.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.entity.members" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["AC", "Alex Chen", "Admin", "Completed"],
                      ["MJ", "Morgan Jones", "Editor", "In Progress"],
                      ["SK", "Sam Kumar", "Viewer", "Pending"],
                    ].map(([initials, name, role, status]) => (
                      <TableRow key={name}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="text-xs font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{role}</TableCell>
                        <TableCell>
                          <StatusPill status={status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.entity.teams" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Team</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Season</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Falcons U16", "Metro League", "Division 1", "2026"],
                      ["Northside Open", "Summer Cup", "Senior", "2026"],
                      ["Riverside Juniors", "Metro League", "Division 3", "2026"],
                    ].map(([team, competition, grade, season]) => (
                      <TableRow key={team}>
                        <TableCell className="font-medium">{team}</TableCell>
                        <TableCell>{competition}</TableCell>
                        <TableCell>{grade}</TableCell>
                        <TableCell className="text-right">{season}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.entity.fixtures" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Round</TableHead>
                      <TableHead>Fixture</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead className="text-right">Publish</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["R1", "Falcons vs Rangers", "Main Oval", "Completed"],
                      ["R2", "Northside vs Riverside", "Court 2", "In Progress"],
                      ["R3", "City vs United", "Stadium A", "Pending"],
                    ].map(([round, fixture, venue, state]) => (
                      <TableRow key={fixture}>
                        <TableCell className="font-mono text-xs font-semibold">{round}</TableCell>
                        <TableCell className="font-medium">{fixture}</TableCell>
                        <TableCell>{venue}</TableCell>
                        <TableCell className="text-right">
                          <StatusPill status={state} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.entity.assets" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Round 1 tile", "Social", "Content", "Today"],
                      ["Sponsor lockup", "Brand", "Admin", "Yesterday"],
                      ["Fixture poster", "Print", "Design", "Apr 22"],
                    ].map(([asset, type, owner, modified]) => (
                      <TableRow key={asset}>
                        <TableCell className="font-medium">{asset}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{owner}</TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {modified}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.entity.billing" />
              <div className="bg-background max-w-4xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["INV-2048", "Completed", "Paid Apr 18", "$420.00"],
                      ["INV-2049", "Pending", "May 01", "$320.00"],
                      ["INV-2050", "In Progress", "May 08", "$180.00"],
                    ].map(([invoice, status, due, amount]) => (
                      <TableRow key={invoice}>
                        <TableCell className="font-mono text-xs font-semibold">{invoice}</TableCell>
                        <TableCell>
                          <StatusPill status={status} />
                        </TableCell>
                        <TableCell>{due}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Responsive Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Responsive table treatments for overflow, hidden secondary columns, card-style mobile
              rows, sticky first columns, and sticky headers.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.responsive.scroll" />
              <div className="bg-background overflow-x-auto rounded-lg border">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Fixture</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Falcons vs Rangers", "R1", "Main Oval", "9:00 AM", "Completed", "Alex"],
                      ["Northside vs Riverside", "R2", "Court 2", "11:30 AM", "Pending", "Morgan"],
                    ].map(([fixture, round, venue, time, status, owner]) => (
                      <TableRow key={fixture}>
                        <TableCell className="font-medium">{fixture}</TableCell>
                        <TableCell>{round}</TableCell>
                        <TableCell>{venue}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell>
                          <StatusPill status={status} />
                        </TableCell>
                        <TableCell className="text-right">{owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.responsive.priority-columns" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Team</TableHead>
                      <TableHead className="hidden md:table-cell">Competition</TableHead>
                      <TableHead className="hidden lg:table-cell">Grade</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Falcons U16", "Metro League", "Division 1", "Completed"],
                      ["Northside Open", "Summer Cup", "Senior", "Pending"],
                      ["Riverside Juniors", "Metro League", "Division 3", "In Progress"],
                    ].map(([team, competition, grade, status]) => (
                      <TableRow key={team}>
                        <TableCell className="font-medium">{team}</TableCell>
                        <TableCell className="hidden md:table-cell">{competition}</TableCell>
                        <TableCell className="hidden lg:table-cell">{grade}</TableCell>
                        <TableCell className="text-right">
                          <StatusPill status={status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.responsive.card-collapse" />
              <div className="grid gap-3 md:hidden">
                {auditData.slice(0, 3).map((row) => (
                  <div key={row.id} className="bg-background space-y-3 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{row.project}</div>
                        <TypographyMuted className="font-mono text-xs">{row.id}</TypographyMuted>
                      </div>
                      <StatusPill status={row.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Run date</span>
                      <span>{row.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-background hidden overflow-hidden rounded-lg border md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 3).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-right">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.responsive.sticky-first-column" />
              <div className="bg-background overflow-x-auto rounded-lg border">
                <Table className="min-w-[820px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="bg-muted sticky left-0 z-10">Team</TableHead>
                      <TableHead>R1</TableHead>
                      <TableHead>R2</TableHead>
                      <TableHead>R3</TableHead>
                      <TableHead>R4</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Falcons", "W", "W", "L", "W", "9"],
                      ["Rangers", "L", "W", "W", "L", "6"],
                      ["Riverside", "W", "L", "L", "W", "6"],
                    ].map(([team, r1, r2, r3, r4, points]) => (
                      <TableRow key={team}>
                        <TableCell className="bg-background sticky left-0 z-10 font-medium">
                          {team}
                        </TableCell>
                        <TableCell>{r1}</TableCell>
                        <TableCell>{r2}</TableCell>
                        <TableCell>{r3}</TableCell>
                        <TableCell>{r4}</TableCell>
                        <TableCell className="text-right font-semibold">{points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.responsive.sticky-header" />
              <div className="bg-background max-h-80 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="bg-muted sticky top-0 z-10">Audit ID</TableHead>
                      <TableHead className="bg-muted sticky top-0 z-10">Project</TableHead>
                      <TableHead className="bg-muted sticky top-0 z-10">Status</TableHead>
                      <TableHead className="bg-muted sticky top-0 z-10 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...auditData, ...auditData, ...auditData].map((row, index) => (
                      <TableRow key={`${row.id}-${index}`}>
                        <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-right">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Action Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Row-level action patterns for menus, inline controls, navigation, expanded detail, and
              destructive confirmation states.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.actions.inline-menu" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 3).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.actions.inline-buttons" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Request</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="text-right">Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Publish round 1", "Alex"],
                      ["Approve sponsor asset", "Morgan"],
                      ["Release fixture update", "Sam"],
                    ].map(([request, owner]) => (
                      <TableRow key={request}>
                        <TableCell className="font-medium">{request}</TableCell>
                        <TableCell>{owner}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              Reject
                            </Button>
                            <Button variant="brand" size="sm" className="h-8">
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.actions.row-link" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Audit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Destination</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row) => (
                      <TableRow key={row.id} className="hover:bg-primary/5 cursor-pointer">
                        <TableCell>
                          <div className="font-medium">{row.project}</div>
                          <TypographyMuted className="font-mono text-xs">{row.id}</TypographyMuted>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={row.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          Open report
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.actions.expandable-row" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{auditData[0].project}</TableCell>
                      <TableCell>
                        <StatusPill status={auditData[0].status} />
                      </TableCell>
                      <TableCell className="text-right">{auditData[0].score}%</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="bg-muted/20 p-4">
                        <div className="bg-background grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
                          {[
                            ["Accessibility", "Passed"],
                            ["Performance", "Review"],
                            ["SEO", "Passed"],
                          ].map(([label, result]) => (
                            <div key={label}>
                              <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                                {label}
                              </TypographyMuted>
                              <div className="mt-1 text-sm font-medium">{result}</div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.actions.confirming" />
              <div className="bg-background max-w-4xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Confirming Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Archived sponsor lockup", "Pending", "Delete"],
                      ["Round 1 draft tile", "In Progress", "Archive"],
                      ["Old fixture export", "Completed", "Remove"],
                    ].map(([asset, status, action], index) => (
                      <TableRow key={asset}>
                        <TableCell className="font-medium">{asset}</TableCell>
                        <TableCell>
                          <StatusPill status={status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {index === 0 ? (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                Cancel
                              </Button>
                              <Button variant="destructive" size="sm" className="h-8">
                                Confirm
                              </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="h-8">
                              {action}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Special States</TypographyH2>
            <TypographyMuted className="mt-1">
              Empty, loading, error, filtered-empty, and disabled table states inside the same table
              shell.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.state.empty" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="h-40 text-center">
                        <div className="mx-auto max-w-sm space-y-3">
                          <div className="text-sm font-semibold">No audits yet</div>
                          <TypographyMuted className="text-xs">
                            Create the first audit to start tracking project quality.
                          </TypographyMuted>
                          <Button variant="brand" size="sm">
                            Run audit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.state.loading" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4].map((row) => (
                      <TableRow key={row}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="ml-auto h-4 w-20" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.state.error" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="h-36">
                        <div className="border-destructive/20 bg-destructive/5 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-lg border p-4">
                          <div>
                            <div className="text-destructive text-sm font-semibold">
                              Failed to load table data
                            </div>
                            <TypographyMuted className="text-xs">
                              The reporting API timed out while loading rows.
                            </TypographyMuted>
                          </div>
                          <Button variant="outline" size="sm">
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.state.filtered-empty" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <div className="border-b p-4">
                  <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input value="zebra league" readOnly className="h-9 rounded-lg pl-10" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="h-32 text-center">
                        <div className="space-y-3">
                          <TypographyMuted>No rows match the current filter.</TypographyMuted>
                          <Button variant="outline" size="sm">
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.state.disabled" />
              <div className="bg-background max-w-4xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.slice(0, 4).map((row, index) => (
                      <TableRow key={row.id} className={index === 2 ? "opacity-50" : undefined}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <StatusPill status={index === 2 ? "Pending" : row.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={index === 2}
                          >
                            {index === 2 ? "Archived" : "Open"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>

        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Comparison / Summary Tables</TypographyH2>
            <TypographyMuted className="mt-1">
              Summary tables for totals, grouped rows, labelled row sections, plan comparison, and
              weighted scorecards.
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <TableReferenceName name="table.summary.totals-footer" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Fixture packs", "12", "$1,200"],
                      ["Media exports", "8", "$640"],
                      ["Sync jobs", "4", "$240"],
                    ].map(([item, qty, amount]) => (
                      <TableRow key={item}>
                        <TableCell className="font-medium">{item}</TableCell>
                        <TableCell className="text-right tabular-nums">{qty}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {amount}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">24</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        $2,080
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.summary.grouped-rows" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Status Group</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Completed", "Acme Corporate Site", "94%"],
                      ["Completed", "Stark Industries v4", "88%"],
                      ["In Progress", "Globex App Dashboard", "Pending"],
                      ["Failed", "Soylent Corp LP", "42%"],
                    ].map(([group, project, score], index) => (
                      <TableRow key={`${group}-${project}`}>
                        <TableCell>
                          {index === 0 ||
                          group !==
                            ["Completed", "Completed", "In Progress", "Failed"][index - 1] ? (
                            <StatusPill status={group} />
                          ) : null}
                        </TableCell>
                        <TableCell className="font-medium">{project}</TableCell>
                        <TableCell className="text-right tabular-nums">{score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.summary.sectioned" />
              <div className="bg-background overflow-hidden rounded-lg border">
                <Table>
                  <TableBody>
                    {[
                      [
                        "Publishing",
                        [
                          ["Fixture publish", "Ready"],
                          ["Round tile", "Review"],
                        ],
                      ],
                      [
                        "Operations",
                        [
                          ["Webhook sync", "Running"],
                          ["Invoice export", "Queued"],
                        ],
                      ],
                    ].map(([section, rows]) => (
                      <Fragment key={section as string}>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={2} className="text-xs font-semibold uppercase">
                            {section as string}
                          </TableCell>
                        </TableRow>
                        {(rows as string[][]).map(([label, state]) => (
                          <TableRow key={label}>
                            <TableCell className="font-medium">{label}</TableCell>
                            <TableCell className="text-right">{state}</TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <TableReferenceName name="table.comparison.matrix" />
              <div className="bg-background overflow-x-auto rounded-lg border">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-center">Starter</TableHead>
                      <TableHead className="text-center">Pro</TableHead>
                      <TableHead className="text-center">League</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Fixture exports", "5", "Unlimited", "Unlimited"],
                      ["Brand templates", "Basic", "Advanced", "Custom"],
                      ["Priority sync", "No", "Yes", "Yes"],
                    ].map(([feature, starter, pro, league]) => (
                      <TableRow key={feature}>
                        <TableCell className="font-medium">{feature}</TableCell>
                        <TableCell className="text-center">{starter}</TableCell>
                        <TableCell className="text-center">{pro}</TableCell>
                        <TableCell className="text-center">{league}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 xl:col-span-2">
              <TableReferenceName name="table.comparison.scorecard" />
              <div className="bg-background max-w-5xl overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Criteria</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Accessibility", "30%", "92", "Pass"],
                      ["Performance", "25%", "81", "Review"],
                      ["Content quality", "25%", "88", "Pass"],
                      ["Brand consistency", "20%", "95", "Pass"],
                    ].map(([criteria, weight, score, outcome]) => (
                      <TableRow key={criteria}>
                        <TableCell className="font-medium">{criteria}</TableCell>
                        <TableCell className="text-right tabular-nums">{weight}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {score}
                        </TableCell>
                        <TableCell className="text-right">{outcome}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell className="font-semibold">Weighted total</TableCell>
                      <TableCell />
                      <TableCell className="text-right font-semibold tabular-nums">89</TableCell>
                      <TableCell className="text-right font-semibold">Approved</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
