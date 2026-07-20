"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";

import "react-easy-crop/react-easy-crop.css";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";
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

type ImageCropDialogControlsProps = {
  imageSrc: string;
  aspect: number;
  cropAreaHeight: number | string;
  aspectPresets?: ImageCropAspectPreset[];
  selectedPresetIndex: number;
  onPresetChange?: (index: number) => void;
  onConfirm: (pixelCrop: Area) => void;
  onCancel: () => void;
  footerClassName?: string;
  presetSelectId?: string;
  zoomSliderId?: string;
};

function ImageCropDialogControls({
  imageSrc,
  aspect,
  cropAreaHeight,
  aspectPresets,
  selectedPresetIndex,
  onPresetChange,
  onConfirm,
  onCancel,
  footerClassName,
  presetSelectId = "crop-aspect-preset",
  zoomSliderId = "crop-zoom",
}: ImageCropDialogControlsProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);

  const showPresetPicker = Boolean(aspectPresets && aspectPresets.length > 1 && onPresetChange);

  React.useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [imageSrc, aspect]);

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;
    onConfirm(croppedAreaPixels);
  };

  return (
    <>
      {showPresetPicker && aspectPresets ? (
        <div className="space-y-2">
          <Label htmlFor={presetSelectId} className="text-muted-foreground text-xs">
            Aspect ratio
          </Label>
          <Select
            value={String(selectedPresetIndex)}
            onValueChange={(v) => {
              onPresetChange?.(Number(v));
            }}
          >
            <SelectTrigger id={presetSelectId} className="w-full max-w-sm" size="sm">
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
        style={{
          height: typeof cropAreaHeight === "number" ? cropAreaHeight : cropAreaHeight,
        }}
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
        <Label htmlFor={zoomSliderId} className="text-muted-foreground text-xs">
          Zoom
        </Label>
        <Slider
          id={zoomSliderId}
          min={1}
          max={3}
          step={0.01}
          value={[zoom]}
          onValueChange={(v) => setZoom(v[0] ?? 1)}
        />
      </div>
      <div
        className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", footerClassName)}
      >
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={handleConfirm}
          disabled={!croppedAreaPixels}
        >
          Apply crop
        </Button>
      </div>
    </>
  );
}

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
  const isMobile = useIsMobile();
  const mobileCropHeight = "min(50vh, 360px)";
  const effectiveCropHeight = isMobile ? mobileCropHeight : cropAreaHeight;

  const presetProps =
    aspectPresets && aspectPresets.length > 1 && onPresetChange
      ? { aspectPresets, selectedPresetIndex, onPresetChange }
      : {};

  const controlsKey = `${imageSrc}-${aspect}-${selectedPresetIndex}-${open ? "open" : "closed"}`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2">
            <ImageCropDialogControls
              key={controlsKey}
              imageSrc={imageSrc}
              aspect={aspect}
              cropAreaHeight={effectiveCropHeight}
              selectedPresetIndex={selectedPresetIndex}
              onConfirm={onConfirm}
              onCancel={() => onOpenChange(false)}
              presetSelectId="crop-aspect-preset-mobile"
              zoomSliderId="crop-zoom-mobile"
              {...presetProps}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className={cn("gap-4 sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ImageCropDialogControls
          key={controlsKey}
          imageSrc={imageSrc}
          aspect={aspect}
          cropAreaHeight={effectiveCropHeight}
          selectedPresetIndex={selectedPresetIndex}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
          footerClassName="sm:justify-end"
          {...presetProps}
        />
      </DialogContent>
    </Dialog>
  );
}
