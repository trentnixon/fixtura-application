"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SaveOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveOrderDialog({ open, onOpenChange }: SaveOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order saved</DialogTitle>
          <DialogDescription>
            Your updated list order has been saved in this interaction demo. No backend save was
            performed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Acknowledge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
