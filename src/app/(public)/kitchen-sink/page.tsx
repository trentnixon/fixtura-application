export default function KitchenSinkOverview() {
  return (
    <div className="space-y-6">
      <header className="border-border border-b pb-6">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight">
          Design Reference
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl font-sans text-lg">
          The Kitchen Sink is the live visual source of truth for Fixtura's UI patterns. It
          references our core design tokens like typography, colors, and primitive components.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Typography</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Verify heading and body fonts, weights, and hierarchical sizing.
          </p>
          <a
            href="/kitchen-sink/typography"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Typography &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Brand Colors</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Showcase the expanded semantic color system including primary, success, error, warning
            and neutral tones.
          </p>
          <a
            href="/kitchen-sink/brand-colors"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Brand Colors &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Containers</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            A foundational set of structural components to ensure consistent page layouts, spacing,
            and rhythm.
          </p>
          <a
            href="/kitchen-sink/containers"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Containers &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Navigation</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Components for wayfinding and site structure, including nav menus, menubars, and
            breadcrumbs.
          </p>
          <a
            href="/kitchen-sink/navigation"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Navigation &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Buttons</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Essential interaction triggers including secondary, ghost, outline, and destructive
            variants.
          </p>
          <a
            href="/kitchen-sink/buttons"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Buttons &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Cards</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Versatile content containers for dashboard modules, feed items, and grouped information.
          </p>
          <a
            href="/kitchen-sink/cards"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Cards &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Toasts</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Brief, non-blocking feedback messages including success, error, and contextual alerts.
          </p>
          <a
            href="/kitchen-sink/toasts"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Toasts &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Forms</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Standardized input layouts, validation patterns, and UI for complex data entry.
          </p>
          <a
            href="/kitchen-sink/forms"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Forms &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Dialogs</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Modal overlays for focused actions, alerts, and critical system confirmations.
          </p>
          <a
            href="/kitchen-sink/dialogs"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Dialogs &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Tables</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Structured data visualization with sorting, filtering, and standard row-based
            information density.
          </p>
          <a
            href="/kitchen-sink/tables"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Tables &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Popovers</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Floating content panels for contextual information, small forms, and quick settings.
          </p>
          <a
            href="/kitchen-sink/popovers"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Popovers &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Loading</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Standardized branded loaders, skeleton screens, and progress indicators for the
            platform.
          </p>
          <a
            href="/kitchen-sink/loading"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Loading &rarr;
          </a>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="font-heading text-foreground mb-2 text-lg font-semibold">Inputs</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Advanced control elements including Selects, Date Pickers, OTP inputs, and Sliders.
          </p>
          <a
            href="/kitchen-sink/inputs"
            className="text-primary text-sm font-medium hover:underline"
          >
            View Inputs &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
