import { TypographyMuted } from "@/components/typography";
import { Switch } from "@/components/ui/switch";

import type { ReactNode } from "react";

export function SettingsToggleRow(props: {
  title: ReactNode;
  description: string;
  checked: boolean;
  disabled: boolean;
  id: string;
  onCheckedChange: (next: boolean) => void;
}) {
  const { title, description, checked, disabled, id, onCheckedChange } = props;

  return (
    <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="space-y-1">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(Boolean(next))}
        className="shrink-0"
      />
    </li>
  );
}
