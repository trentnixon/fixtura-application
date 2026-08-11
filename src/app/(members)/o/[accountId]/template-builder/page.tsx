import { TemplateBuilderContent } from "./template-builder-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-3">
      <div>
        <h1 className="font-brand text-xl font-semibold sm:text-2xl">Design your template</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Pick a style, colours, and background — the preview updates as you go.
        </p>
      </div>
      <TemplateBuilderContent accountId={accountId} />
    </div>
  );
}
