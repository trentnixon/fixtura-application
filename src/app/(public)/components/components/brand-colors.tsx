import { TypographyP } from "@/components/typography/p";

export function BrandColorsPanel() {
  const items = [
    { name: "brand", className: "bg-brand" },
    { name: "primary", className: "bg-primary" },
    { name: "secondary", className: "bg-secondary" },
    { name: "accent", className: "bg-accent" },
    { name: "muted", className: "bg-muted" },
    { name: "destructive", className: "bg-destructive" },
    { name: "border", className: "bg-border" },
    { name: "input", className: "bg-input" },
    { name: "ring", className: "bg-ring" },
    { name: "card", className: "bg-card" },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.name} className="flex items-center gap-2">
            <span className={`${it.className} size-6 rounded-md border`} />
            <span className="text-sm">{it.name}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <TypographyP>Usage examples</TypographyP>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand text-brand-foreground inline-flex items-center rounded px-2 py-1 text-xs">
            bg-brand
          </span>
          <span className="inline-flex items-center rounded border px-2 py-1 text-xs">border</span>
          <span className="bg-primary text-primary-foreground inline-flex items-center rounded px-2 py-1 text-xs">
            primary
          </span>
          <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded px-2 py-1 text-xs">
            secondary
          </span>
        </div>
      </div>
    </div>
  );
}
