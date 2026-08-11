import { cn } from "@/lib/utils";

export function BundlesSchedulerRunStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "active";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
