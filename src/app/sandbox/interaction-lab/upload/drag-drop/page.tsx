import {
  TypographyH1,
  TypographyH2,
  TypographyList,
  TypographyMuted,
} from "@/components/typography";

export const metadata = {
  title: "Drag and drop upload — Interaction lab",
  description: "Planned: drag-and-drop upload mechanics.",
};

export default function InteractionLabUploadDragDropPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <TypographyH1 className="text-2xl font-semibold tracking-tight">
          Drag and drop upload
        </TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          Planned area for drag state, file validation, upload progress, and retry behaviour—mock
          only, no real upload infrastructure.
        </TypographyMuted>
      </header>
      <section className="space-y-2">
        <TypographyH2 className="text-base font-semibold">Planned coverage</TypographyH2>
        <TypographyList className="text-muted-foreground list-inside space-y-1">
          <li>Idle</li>
          <li>Drag hover</li>
          <li>Invalid file</li>
          <li>Oversized file</li>
          <li>Uploading</li>
          <li>Success</li>
          <li>Error</li>
          <li>Retry</li>
        </TypographyList>
      </section>
    </article>
  );
}
