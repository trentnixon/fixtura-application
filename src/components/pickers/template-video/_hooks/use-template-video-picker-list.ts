"use client";

import { useMemo } from "react";

import { useTemplateVideosUi } from "@/lib/api/hooks/template-videos/useTemplateVideosUi";

import { resolveSelectedTemplateVideoIdString } from "../_utils";
import { useTemplateVideoPickerSelection } from "./use-template-video-picker-selection";

export function useTemplateVideoPickerList(accountId: string) {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateVideosUi();
  const { selectedId, setSelectedId } = useTemplateVideoPickerSelection(accountId);
  const videos = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateVideoIdString(videos, selectedId),
    [videos, selectedId],
  );

  const firstVideo = videos[0];
  const selectValue = resolvedSelectedId ?? (firstVideo !== undefined ? String(firstVideo.id) : "");

  const selectedVideo = useMemo(() => {
    if (selectValue === "") return null;
    return videos.find((item) => String(item.id) === selectValue) ?? null;
  }, [videos, selectValue]);

  return {
    data,
    videos,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedVideo,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
