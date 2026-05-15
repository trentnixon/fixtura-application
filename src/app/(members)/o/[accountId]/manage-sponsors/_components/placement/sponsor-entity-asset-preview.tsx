"use client";

import { useMemo, useRef } from "react";

import { templateModeUsesDarkTitlesOnGradient } from "@/components/pickers/template-mode/_utils";
import { Surface } from "@/components/ui/container";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import { buildEntityTargetKey } from "../../_utils/sponsorship-allocation-entity";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";
import type { EntityTargetAllocation } from "../../_utils/sponsorship-allocation-entity";
import type { AccountSponsorEntityTarget } from "@/types/api/account";

export type SponsorEntityAssetPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  templateModeSlug?: string | null;
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  primarySponsors: ManageSponsorsWorkspaceSponsor[];
  previewTargets: AccountSponsorEntityTarget[];
  className?: string;
};

const FALLBACK_PRIMARY = "#64748B";
const FALLBACK_SECONDARY = "#94A3B8";

type EntityPreviewCard = {
  target: AccountSponsorEntityTarget;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
};

function targetLabel(target: AccountSponsorEntityTarget) {
  return target.label || target.name || `${target.type} target`;
}

function SponsorLogoPreview({
  sponsor,
  className,
  imageClassName,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  className?: string;
  imageClassName?: string;
}) {
  const src = sponsor?.logoUrl;

  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl",
        !src && "border border-dashed border-white/35 bg-white/15",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={cn("size-full max-h-full max-w-full object-contain p-3", imageClassName)}
        />
      ) : null}
    </div>
  );
}

function PrimarySponsorLogoPreview({ sponsor }: { sponsor: ManageSponsorsWorkspaceSponsor }) {
  const src = sponsor.logoUrl;

  return (
    <div
      className="flex h-11 w-14 min-w-0 shrink-0 items-center justify-center overflow-hidden rounded bg-white/15"
      title={sponsor.name}
    >
      {src ? (
        <img src={src} alt="" className="size-full max-h-full max-w-full object-contain p-1" />
      ) : null}
    </div>
  );
}

export function SponsorEntityAssetPreview({
  primaryHex,
  secondaryHex,
  templateModeSlug,
  allocationsByTarget,
  sponsorByNumericId,
  primarySponsors,
  previewTargets,
  className,
}: SponsorEntityAssetPreviewProps) {
  const lastPrimaryRef = useRef<string>(FALLBACK_PRIMARY);
  const lastSecondaryRef = useRef<string>(FALLBACK_SECONDARY);

  const np = tryNormalizeHex(primaryHex);
  const ns = tryNormalizeHex(secondaryHex);
  if (np) lastPrimaryRef.current = np;
  if (ns) lastSecondaryRef.current = ns;

  const primary = np ?? lastPrimaryRef.current;
  const secondary = ns ?? lastSecondaryRef.current;

  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const footerTextClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]"
    : "text-white/90";
  const footerBorderClass = gradientHeroTitlesDark ? "border-black/20" : "border-white/25";

  const previewCards = useMemo<EntityPreviewCard[]>(
    () =>
      previewTargets.flatMap((target) => {
        const assignment = allocationsByTarget.get(buildEntityTargetKey(target))?.[0] ?? null;
        if (!assignment) return [];

        return [
          {
            target,
            sponsor: sponsorByNumericId.get(assignment.sponsorId) ?? null,
          },
        ];
      }),
    [allocationsByTarget, previewTargets, sponsorByNumericId],
  );

  if (previewCards.length === 0) {
    return (
      <div className="bg-card text-muted-foreground flex min-h-64 items-center justify-center rounded-xl border p-6 text-sm shadow-sm">
        No targeted entities yet.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        previewCards.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "mx-auto max-w-md grid-cols-1",
        className,
      )}
    >
      {previewCards.map(({ target, sponsor }) => (
        <Surface
          key={buildEntityTargetKey(target)}
          className="ring-border overflow-hidden p-0 shadow-sm ring-1"
        >
          <div className="min-w-0">
            <div
              className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-2 overflow-hidden text-left"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              }}
            >
              <div className="flex min-h-0 flex-1 items-start p-3 sm:p-4">
                <p
                  className={cn(
                    "max-w-[16rem] text-2xl leading-tight font-semibold text-balance",
                    footerTextClass,
                  )}
                >
                  {targetLabel(target)}
                </p>
              </div>

              <div
                className={cn(
                  "mt-auto grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t p-2 sm:gap-3 sm:p-2.5",
                  footerBorderClass,
                )}
              >
                <div
                  className="flex min-w-0 items-center gap-1.5 overflow-hidden"
                  aria-label="Primary sponsors"
                >
                  {primarySponsors.slice(0, 4).map((primarySponsor, index) => (
                    <PrimarySponsorLogoPreview
                      key={`primary-sponsor-${index}`}
                      sponsor={primarySponsor}
                    />
                  ))}
                </div>
                <SponsorLogoPreview
                  sponsor={sponsor}
                  className="h-14 w-20 flex-none rounded-md border-0 bg-transparent"
                  imageClassName="p-0"
                />
              </div>
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}
