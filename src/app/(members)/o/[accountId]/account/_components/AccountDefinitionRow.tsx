import type { AccountDefinitionRowProps } from "../_types/account-display-primitives";

export function AccountDefinitionRow({ label, value }: AccountDefinitionRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground min-w-0 text-sm font-medium">{value}</dd>
    </div>
  );
}
