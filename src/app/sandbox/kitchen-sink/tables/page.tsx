"use client";

import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  Download,
  Users,
  Timer,
} from "lucide-react";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, GlassSurface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
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

export default function TablesPage() {
  return (
    <div className="space-y-12 pb-20">
      <PageHeader
        title="Table Visualization"
        description="Standardized patterns for displaying structured data, audit logs, and member lists with premium styling."
      />

      <div className="space-y-24">
        {/* Normal Table */}
        <Section spacing="none">
          <div className="mb-6">
            <TypographyH2 className="text-2xl font-bold">Basic Table</TypographyH2>
            <TypographyMuted className="mt-1">
              Simple data presentation within a standard premium surface.
            </TypographyMuted>
          </div>

          <GlassSurface className="overflow-hidden p-0">
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
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          row.status === "Completed"
                            ? "bg-success/5 text-success border-success/10"
                            : row.status === "In Progress"
                              ? "bg-primary/5 text-primary border-primary/10"
                              : row.status === "Failed"
                                ? "bg-destructive/5 text-destructive border-destructive/10"
                                : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassSurface>
        </Section>

        {/* Advanced Table */}
        <Section spacing="none">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <TypographyH2 className="text-2xl font-bold">Advanced Data Grid</TypographyH2>
              <TypographyMuted className="mt-1">
                Rich interactions including search, filtering, and row actions.
              </TypographyMuted>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="brand" size="sm">
                Run New Audit
              </Button>
            </div>
          </div>

          <GlassSurface className="border-primary/10 overflow-hidden p-0 shadow-2xl">
            {/* Toolbar */}
            <div className="bg-card/30 flex flex-col items-center justify-between gap-4 border-b p-4 sm:flex-row">
              <div className="relative w-full sm:w-80">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input placeholder="Filter projects..." className="h-9 rounded-lg pl-10" />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-2 h-3.5 w-3.5" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  Status <ChevronDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40px]">
                    <div className="border-muted-foreground/30 h-4 w-4 rounded border" />
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <Button
                      variant="ghost"
                      className="-ml-2 h-8 px-2 text-xs font-bold uppercase hover:bg-transparent"
                    >
                      ID <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="-ml-2 h-8 px-2 text-xs font-bold uppercase hover:bg-transparent"
                    >
                      Project <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditData.map((row) => (
                  <TableRow key={row.id} className="group">
                    <TableCell>
                      <div className="border-muted-foreground/30 group-hover:border-primary/50 h-4 w-4 rounded border transition-colors" />
                    </TableCell>
                    <TableCell className="font-mono text-[10px] font-bold tracking-tighter opacity-60">
                      {row.id}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{row.project}</span>
                        <span className="text-muted-foreground mt-0.5 text-[10px] font-medium tracking-widest uppercase">
                          Verification Key: {row.id.toLowerCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.score ? (
                        <div className="flex items-center gap-3">
                          <div className="bg-muted h-1.5 w-24 flex-1 overflow-hidden rounded-full">
                            <div
                              className={`h-full ${row.score > 90 ? "bg-success" : row.score > 70 ? "bg-primary" : "bg-destructive"}`}
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold tabular-nums">{row.score}%</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground flex items-center gap-2">
                          <Timer className="size-3.5 animate-pulse" />
                          <span className="text-[10px] font-bold tracking-tighter uppercase italic">
                            Calculating
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="border-background bg-muted flex size-6 items-center justify-center overflow-hidden rounded-full border-2"
                          >
                            <Users className="text-muted-foreground size-3" />
                          </div>
                        ))}
                        <div className="border-background bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full border-2 text-[8px] font-bold">
                          +5
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group-hover:bg-primary/10 group-hover:text-primary h-8 w-8 rounded-lg transition-all"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Mock */}
            <div className="bg-muted/20 flex items-center justify-between border-t p-4">
              <TypographyMuted className="text-xs">
                Showing <strong>5</strong> of <strong>24</strong> results
              </TypographyMuted>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-bold" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-4 text-xs font-bold">
                  Next
                </Button>
              </div>
            </div>
          </GlassSurface>
        </Section>
      </div>
    </div>
  );
}
