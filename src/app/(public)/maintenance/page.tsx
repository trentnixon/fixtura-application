import { TypographyH1, TypographyMuted } from "@/components/typography";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

export const metadata = buildPageMetadata({
  title: "Maintenance",
  description: "Fixtura Members is temporarily unavailable while we perform maintenance.",
});

export default function Page() {
  return (
    <div className="py-20 text-center">
      <TypographyH1>Maintenance</TypographyH1>
      <TypographyMuted className="mt-2">Placeholder for maintenance page</TypographyMuted>
    </div>
  );
}
