import { Constrained } from "@/components/containers/Constrained";
import { FullWidth } from "@/components/containers/FullWidth";
import { SidebarLayout } from "@/components/containers/SidebarLayout";
import { TypographyP } from "@/components/typography/p";

export function ContainerOptionsPanel() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <TypographyP>Overview</TypographyP>
        <TypographyP>
          We do not ship any container styles by default. This panel shows how to use utility
          classes to style container elements.
        </TypographyP>
      </section>

      <section className="grid gap-2">
        <TypographyP>Full width</TypographyP>
        <FullWidth>This section spans full width of the container.</FullWidth>
      </section>

      <section className="grid gap-2">
        <TypographyP>Constrained widths</TypographyP>
        <Constrained size="2xl">max-w-2xl</Constrained>
        <Constrained size="3xl">max-w-3xl</Constrained>
        <Constrained size="6xl">max-w-6xl</Constrained>
      </section>

      <section className="grid gap-2">
        <TypographyP>Sidebar layout</TypographyP>
        <SidebarLayout sidebar={<span>Sidebar</span>} main={<span>Main content</span>} />
      </section>
    </div>
  );
}
