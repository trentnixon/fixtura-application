import { TemplateBuilderContent } from "./template-builder-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-brand text-xl font-semibold sm:text-2xl">Design your template</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Choose your template style, colour variation, and background. The preview updates as you
          go—save when you are happy with how your assets look.
        </p>
      </div>
      <TemplateBuilderContent accountId={accountId} />
    </div>
  );
}
