"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CardReferenceName({ name }: { name: string }) {
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
