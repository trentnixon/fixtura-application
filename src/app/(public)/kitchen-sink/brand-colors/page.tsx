export default function BrandColorsPage() {
  const colorScales = {
    primary: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    "brand-secondary": ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    "brand-accent": ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    success: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    warning: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    error: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    neutral: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
  };

  return (
    <div className="space-y-12">
      <header className="border-border border-b pb-6">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight">
          Brand Colors
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl font-sans text-lg">
          Our tokenized color scales extending from the base palette. The 500-level shade generally
          represents the core brand token requested, with values expanding dynamically across
          standard UI requirements.
        </p>
      </header>

      <section>
        <h2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          Base Brand Palette
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="bg-background border-border flex h-32 flex-col justify-end rounded-xl border p-4 shadow-sm">
            <span className="text-foreground text-sm font-semibold">Background</span>
            <span className="text-muted-foreground text-xs">#FAFBFC</span>
          </div>
          <div className="bg-card border-border flex h-32 flex-col justify-end rounded-xl border p-4 shadow-sm">
            <span className="text-card-foreground text-sm font-semibold">Surface</span>
            <span className="text-muted-foreground text-xs">#FFFFFF</span>
          </div>
          <div className="bg-border flex h-32 flex-col justify-end rounded-xl p-4 shadow-sm">
            <span className="text-foreground text-sm font-semibold">Border</span>
            <span className="text-muted-foreground text-xs">#E6EAF0</span>
          </div>
          <div className="bg-foreground text-background flex h-32 flex-col justify-end rounded-xl p-4 shadow-sm">
            <span className="text-sm font-semibold">Text</span>
            <span className="text-xs opacity-80">#111827</span>
          </div>
          <div className="bg-muted-foreground text-background flex h-32 flex-col justify-end rounded-xl p-4 shadow-sm">
            <span className="text-sm font-semibold">Text Muted</span>
            <span className="text-xs opacity-80">#4B5563</span>
          </div>
          <div className="bg-primary text-primary-foreground border-border flex h-32 flex-col justify-end rounded-xl border p-4 shadow-sm">
            <span className="text-sm font-semibold">Primary</span>
            <span className="text-xs opacity-80">#4C82C6</span>
          </div>
          <div className="border-border flex h-32 flex-col justify-end rounded-xl border bg-[var(--brand-secondary)] p-4 text-white shadow-sm">
            <span className="text-sm font-semibold">Secondary (Teal)</span>
            <span className="text-xs opacity-80">#14B8A6</span>
          </div>
          <div className="border-border flex h-32 flex-col justify-end rounded-xl border bg-[var(--brand-accent)] p-4 text-white shadow-sm">
            <span className="text-sm font-semibold">Accent (Orange)</span>
            <span className="text-xs opacity-80">#F97316</span>
          </div>
          <div className="bg-success border-border flex h-32 flex-col justify-end rounded-xl border p-4 text-white shadow-sm">
            <span className="text-sm font-semibold">Success</span>
            <span className="text-xs opacity-80">#2CA58D</span>
          </div>
          <div className="bg-warning border-border flex h-32 flex-col justify-end rounded-xl border p-4 text-white shadow-sm">
            <span className="text-sm font-semibold">Warning</span>
            <span className="text-xs opacity-80">#E6A23C</span>
          </div>
          <div className="bg-destructive border-border flex h-32 flex-col justify-end rounded-xl border p-4 text-white shadow-sm">
            <span className="text-sm font-semibold">Error</span>
            <span className="text-xs opacity-80">#D64545</span>
          </div>
        </div>
      </section>

      {/* Expanded Scales */}
      <section>
        <h2 className="text-muted-foreground border-border mb-6 border-b pb-2 text-sm font-semibold tracking-wider uppercase">
          Expanded Scales
        </h2>
        <div className="space-y-8">
          {Object.entries(colorScales).map(([name, scale]) => (
            <div key={name}>
              <h3 className="text-foreground mb-3 font-semibold capitalize">{name}</h3>
              <div className="border-border flex flex-wrap overflow-hidden rounded-lg border md:flex-nowrap">
                {scale.map((shade) => {
                  const varName = `var(--${name}-${shade})`;
                  // Basic logic to flip text color for legibility
                  const isDark = parseInt(shade) > 400 || (name === "primary" && shade === "500");
                  return (
                    <div
                      key={shade}
                      className="flex h-20 min-w-[50px] flex-1 flex-col justify-end p-2 md:h-24 md:p-3"
                      style={{ backgroundColor: varName }}
                    >
                      <span
                        className={`text-xs font-medium ${isDark ? "text-white" : "text-neutral-900"} opacity-90`}
                      >
                        {shade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
