"use client";

import { useMemo } from "react";

import { useTemplateParticlesUi } from "@/lib/api/hooks/template-particles/useTemplateParticlesUi";

import { resolveSelectedTemplateParticleIdString } from "../_utils";
import { useTemplateParticlePickerSelection } from "./use-template-particle-picker-selection";

export function useTemplateParticlePickerList(accountId: string) {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateParticlesUi();
  const { selectedId, setSelectedId } = useTemplateParticlePickerSelection(accountId);
  const particles = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateParticleIdString(particles, selectedId),
    [particles, selectedId],
  );

  const firstParticle = particles[0];
  const selectValue =
    resolvedSelectedId ?? (firstParticle !== undefined ? String(firstParticle.id) : "");

  const selectedParticle = useMemo(() => {
    if (selectValue === "") return null;
    return particles.find((particle) => String(particle.id) === selectValue) ?? null;
  }, [particles, selectValue]);

  return {
    data,
    particles,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedParticle,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
