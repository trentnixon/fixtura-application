"use client";

import { Power } from "lucide-react";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SUPPORT_READ_ONLY_FORM_DESCRIPTION } from "@/lib/support/support-read-only-copy";

import { AccountSectionShell } from "./AccountSectionShell";
import {
  ACCOUNT_ACTIVE_CONFIRM_CANCEL_LABEL,
  ACCOUNT_ACTIVE_CONFIRM_OFF_DESCRIPTION,
  ACCOUNT_ACTIVE_CONFIRM_OFF_LABEL,
  ACCOUNT_ACTIVE_CONFIRM_OFF_TITLE,
  ACCOUNT_ACTIVE_CONFIRM_ON_DESCRIPTION,
  ACCOUNT_ACTIVE_CONFIRM_ON_LABEL,
  ACCOUNT_ACTIVE_CONFIRM_ON_TITLE,
  ACCOUNT_ACTIVE_CONFIRM_SUBMITTING_LABEL,
  ACCOUNT_ACTIVE_SECTION_DESCRIPTION,
  ACCOUNT_ACTIVE_SECTION_TITLE,
  ACCOUNT_ACTIVE_SWITCH_DESCRIPTION,
  ACCOUNT_ACTIVE_SWITCH_ID,
  ACCOUNT_ACTIVE_SWITCH_LABEL,
} from "../_constants/account-active";
import { useAccountActiveSection } from "../_hooks/useAccountActiveSection";

export function AccountActiveSection({
  accountId,
  isActive,
}: {
  accountId: string;
  isActive: boolean;
}) {
  const section = useAccountActiveSection(accountId);
  if (!section.visible) return null;

  const turningOff = section.confirmNext === false;
  const switchDisabled = section.isSupportReadOnly || section.isSubmitting;

  return (
    <>
      <AccountSectionShell
        title={ACCOUNT_ACTIVE_SECTION_TITLE}
        description={ACCOUNT_ACTIVE_SECTION_DESCRIPTION}
        icon={<Power className="size-5" aria-hidden />}
        headerTone="slate"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0 space-y-1">
            <Label htmlFor={ACCOUNT_ACTIVE_SWITCH_ID} className="text-sm font-medium">
              {ACCOUNT_ACTIVE_SWITCH_LABEL}
            </Label>
            <TypographyMuted className="text-xs">
              {ACCOUNT_ACTIVE_SWITCH_DESCRIPTION}
            </TypographyMuted>
            {section.isSupportReadOnly ? (
              <TypographyMuted className="text-xs">
                {SUPPORT_READ_ONLY_FORM_DESCRIPTION}
              </TypographyMuted>
            ) : null}
          </div>
          <Switch
            id={ACCOUNT_ACTIVE_SWITCH_ID}
            checked={isActive}
            disabled={switchDisabled}
            onCheckedChange={(next) => section.requestChange(Boolean(next))}
            className="shrink-0"
          />
        </div>
      </AccountSectionShell>

      <Dialog
        open={section.confirmNext !== null}
        onOpenChange={(open) => {
          if (!open) section.dismiss();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {turningOff ? ACCOUNT_ACTIVE_CONFIRM_OFF_TITLE : ACCOUNT_ACTIVE_CONFIRM_ON_TITLE}
            </DialogTitle>
            <DialogDescription>
              {turningOff
                ? ACCOUNT_ACTIVE_CONFIRM_OFF_DESCRIPTION
                : ACCOUNT_ACTIVE_CONFIRM_ON_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          {section.error ? (
            <p className="text-destructive text-sm" role="alert">
              {section.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={section.dismiss}
              disabled={section.isSubmitting}
            >
              {ACCOUNT_ACTIVE_CONFIRM_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              variant={turningOff ? "destructive" : "default"}
              onClick={section.confirm}
              disabled={section.isSubmitting}
            >
              {section.isSubmitting
                ? ACCOUNT_ACTIVE_CONFIRM_SUBMITTING_LABEL
                : turningOff
                  ? ACCOUNT_ACTIVE_CONFIRM_OFF_LABEL
                  : ACCOUNT_ACTIVE_CONFIRM_ON_LABEL}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
