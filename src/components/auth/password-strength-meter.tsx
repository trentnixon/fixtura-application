"use client";

import { cn } from "@/lib/utils";

function passwordStrengthHint(password: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!password) return { level: 0, label: "" };
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (password.length < 8 || classes <= 1) return { level: 1, label: "Weak" };
  if (password.length < 10 || classes === 2) return { level: 2, label: "Fair" };
  if (password.length < 12 || classes === 3) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}

const STRENGTH_BAR_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "bg-destructive/80",
  2: "bg-amber-500",
  3: "bg-yellow-500",
  4: "bg-emerald-600",
};

function strengthBarColor(level: 0 | 1 | 2 | 3 | 4): string {
  return level === 0 ? "bg-muted" : STRENGTH_BAR_COLORS[level];
}

/**
 * Informational only — not used to block submit (see account / comms handoff).
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label } = passwordStrengthHint(password);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">Password strength</span>
        {level > 0 ? (
          <span className="text-foreground text-xs font-medium">{label}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>
      <div className="flex gap-1" aria-hidden>
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              level > 0 && i <= level ? strengthBarColor(level) : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-[11px] leading-snug">
        For feedback only — not used to validate or block saving.
      </p>
    </div>
  );
}
