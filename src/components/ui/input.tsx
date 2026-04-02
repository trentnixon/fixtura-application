import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-primary/10 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-11 w-full rounded-[0.75rem] border bg-white/60 px-4 text-base shadow-xs transition-all duration-300 outline-none focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-black/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
