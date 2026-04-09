"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";

import "react-easy-crop/react-easy-crop.css";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type ImageCropAspectPreset = {
  aspect: number;
  label: string;
};

export type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  /** Width / height, e.g. 1 for square, 16/9 for landscape */
  aspect: number;
  title?: string;
  description?: string;
  /** Called with pixel crop suitable for `getCroppedImageBlob`. Parent should close the dialog after processing. */
  onConfirm: (pixelCrop: Area) => void;
  /** Cropper area min height (px). */
  cropAreaHeight?: number;
  /** When set with more than one item, a ratio selector is shown above the crop area. */
  aspectPresets?: ImageCropAspectPreset[];
  selectedPresetIndex?: number;
  onPresetChange?: (index: number) => void;
};

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspect,
  title = "Crop image",
  description = "Drag to reposition, use the slider to zoom.",
  onConfirm,
  cropAreaHeight = 280,
  aspectPresets,
  selectedPresetIndex = 0,
  onPresetChange,
}: ImageCropDialogProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);

  const showPresetPicker = Boolean(aspectPresets && aspectPresets.length > 1 && onPresetChange);

  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc, aspect]);

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;
    onConfirm(croppedAreaPixels);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className={cn("gap-4 sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {showPresetPicker && aspectPresets ? (
          <div className="space-y-2">
            <Label htmlFor="crop-aspect-preset" className="text-muted-foreground text-xs">
              Aspect ratio
            </Label>
            <Select
              value={String(selectedPresetIndex)}
              onValueChange={(v) => {
                onPresetChange?.(Number(v));
              }}
            >
              <SelectTrigger id="crop-aspect-preset" className="w-full max-w-sm" size="sm">
                <SelectValue placeholder="Ratio" />
              </SelectTrigger>
              <SelectContent>
                {aspectPresets.map((p, i) => (
                  <SelectItem key={`${p.label}-${i}`} value={String(i)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div
          className="bg-muted relative w-full overflow-hidden rounded-lg"
          style={{ height: cropAreaHeight }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, croppedAreaPixelsNext) => {
              setCroppedAreaPixels(croppedAreaPixelsNext);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crop-zoom" className="text-muted-foreground text-xs">
            Zoom
          </Label>
          <Slider
            id="crop-zoom"
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0] ?? 1)}
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!croppedAreaPixels}>
            Apply crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
