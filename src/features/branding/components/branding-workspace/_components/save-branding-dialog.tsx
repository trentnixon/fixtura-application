"use client";

import { templateModeLabel } from "@/components/pickers/template-mode/_utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { UseBrandingWorkspaceResult } from "../_types";

export type SaveBrandingDialogProps = {
  open: boolean;
  onOpenChange: UseBrandingWorkspaceResult["setSaveDialogOpen"];
  np: string | null;
  ns: string | null;
  templateModesPending: boolean;
  selectedMode: UseBrandingWorkspaceResult["selectedMode"];
  cmsSaveLabStub: boolean;
  colorsReady: boolean;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
};

export function SaveBrandingDialog({
  open,
  onOpenChange,
  np,
  ns,
  templateModesPending,
  selectedMode,
  cmsSaveLabStub,
  colorsReady,
  isPending,
  onConfirm,
}: SaveBrandingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save branding?</DialogTitle>
          <DialogDescription>
            This saves primary, secondary, and contrast to your organisation profile. Templates and
            renders use the new values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {np !== null && ns !== null ? (
            <div className="border-border space-y-4 rounded-lg border p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono text-sm leading-none">
                    Primary {np}
                  </span>
                  <span
                    aria-hidden
                    className="border-border size-7 shrink-0 rounded-md border shadow-sm"
                    style={{ backgroundColor: np }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono text-sm leading-none">
                    Secondary {ns}
                  </span>
                  <span
                    aria-hidden
                    className="border-border size-7 shrink-0 rounded-md border shadow-sm"
                    style={{ backgroundColor: ns }}
                  />
                </div>
              </div>
              <div className="border-border space-y-1 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Contrast selector
                </p>
                {templateModesPending ? (
                  <p className="text-muted-foreground text-sm">Loading template modes…</p>
                ) : selectedMode ? (
                  <p className="text-foreground text-sm font-medium">
                    {templateModeLabel(selectedMode)}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">No template mode selected.</p>
                )}
              </div>
            </div>
          ) : null}
          {cmsSaveLabStub ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Route lab: the CMS save request is not sent yet — wire this dialog when branding APIs
              are connected here.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            disabled={!colorsReady || isPending}
            onClick={() => void onConfirm()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
