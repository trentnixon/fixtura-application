"use client";

import { useMemo } from "react";

import { useTemplateImagesUi } from "@/lib/api/hooks/template-images/useTemplateImagesUi";

import { resolveSelectedTemplateImageIdString } from "../_utils";
import { useTemplateImagePickerSelection } from "./use-template-image-picker-selection";

export function useTemplateImagePickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateImagesUi();
  const { selectedId, setSelectedId } = useTemplateImagePickerSelection();
  const images = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateImageIdString(images, selectedId),
    [images, selectedId],
  );

  const firstImage = images[0];
  const selectValue = resolvedSelectedId ?? (firstImage !== undefined ? String(firstImage.id) : "");

  const selectedImage = useMemo(() => {
    if (selectValue === "") return null;
    return images.find((img) => String(img.id) === selectValue) ?? null;
  }, [images, selectValue]);

  return {
    data,
    images,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedImage,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
