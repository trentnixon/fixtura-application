"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

import { SelectOrgDetailsContent } from "./select-org-details-content";

import type { SelectOrganisationItemViewModel } from "../_utils/select-org-display-state";

type SelectOrgDetailsDialogProps = {
  item: SelectOrganisationItemViewModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrimaryAction: () => void;
  onRetryStatus?: () => void;
  primaryPending?: boolean;
};

export function SelectOrgDetailsDialog({
  item,
  open,
  onOpenChange,
  onPrimaryAction,
  onRetryStatus,
  primaryPending,
}: SelectOrgDetailsDialogProps) {
  const isMobile = useIsMobile();

  if (!item) return null;

  const title = item.name;
  const description = item.statusDescription || "Organisation details";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <SelectOrgDetailsContent
              item={item}
              onPrimaryAction={onPrimaryAction}
              primaryPending={primaryPending ?? false}
              {...(onRetryStatus ? { onRetryStatus } : {})}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <SelectOrgDetailsContent
          item={item}
          onPrimaryAction={onPrimaryAction}
          primaryPending={primaryPending ?? false}
          {...(onRetryStatus ? { onRetryStatus } : {})}
        />
      </DialogContent>
    </Dialog>
  );
}
