"use client";

import { refreshWorkspaceSponsorDerivedFields } from "./sponsor-display";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

function storageKey(accountId: string) {
  return `manage-sponsors:${accountId}:local-sponsors`;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function isLocalSponsorId(sponsorId: number | string) {
  return typeof sponsorId === "string" && sponsorId.startsWith("local-");
}

export function readLocalSponsors(accountId: string): ManageSponsorsWorkspaceSponsor[] {
  if (!canUseSessionStorage()) return [];

  try {
    const raw = window.sessionStorage.getItem(storageKey(accountId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is ManageSponsorsWorkspaceSponsor => {
        return Boolean(item && typeof item === "object" && "id" in item && "name" in item);
      })
      .map((item) =>
        refreshWorkspaceSponsorDerivedFields({
          ...item,
          isDraft: false,
        }),
      );
  } catch {
    return [];
  }
}

export function writeLocalSponsors(accountId: string, sponsors: ManageSponsorsWorkspaceSponsor[]) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(storageKey(accountId), JSON.stringify(sponsors));
}

export function upsertLocalSponsor(accountId: string, sponsor: ManageSponsorsWorkspaceSponsor) {
  const current = readLocalSponsors(accountId);
  const next = current.filter((item) => item.id !== sponsor.id);
  next.unshift(refreshWorkspaceSponsorDerivedFields({ ...sponsor, isDraft: false }));
  writeLocalSponsors(accountId, next);
}
