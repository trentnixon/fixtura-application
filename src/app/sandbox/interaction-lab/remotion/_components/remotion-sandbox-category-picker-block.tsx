"use client";

import Link from "next/link";

import { TemplateCategorySelectPicker } from "@/components/pickers/template-category";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";
import { ROUTES } from "@/lib/config/routes";

type RemotionSandboxCategoryPickerBlockProps = {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: unknown;
  onRetry: () => void;
};

export function RemotionSandboxCategoryPickerBlock({
  isPending,
  isError,
  isEmpty,
  error,
  onRetry,
}: RemotionSandboxCategoryPickerBlockProps) {
  if (isPending) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Loading template categories...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <TypographyMuted className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Request failed"}
        </TypographyMuted>
        <TypographyMuted className="text-sm">
          Sign in to load categories from the CMS. Preview uses the default template until the list
          loads.
        </TypographyMuted>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void onRetry()}>
            Retry
          </Button>
          <Button type="button" variant="default" size="sm" asChild>
            <Link href={ROUTES.signIn}>Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <TypographyMuted className="text-sm">No template categories returned.</TypographyMuted>;
  }

  return <TemplateCategorySelectPicker accountId={PICKER_SANDBOX_ACCOUNT_SCOPE} />;
}
