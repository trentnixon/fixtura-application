import { DEFAULT_REMOTION_SANDBOX_TEMPLATE } from "@/components/remotion/_constants/remotion-templates";
import { TypographyMuted } from "@/components/typography";

type RemotionSandboxFallbackNoteProps = {
  slug: string | null | undefined;
};

export function RemotionSandboxFallbackNote({ slug }: RemotionSandboxFallbackNoteProps) {
  return (
    <TypographyMuted className="mb-4 text-sm text-orange-600 dark:text-orange-400">
      {slug == null || slug.trim() === ""
        ? "Category slug is empty - preview uses the default template."
        : `Unknown slug "${slug}" - preview uses ${DEFAULT_REMOTION_SANDBOX_TEMPLATE}.`}
    </TypographyMuted>
  );
}
