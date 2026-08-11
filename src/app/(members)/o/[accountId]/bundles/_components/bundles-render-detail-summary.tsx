import { TypographyBodySmall } from "@/components/typography";
import { SectionBlock } from "@/components/ui/section";

import { BUNDLES_RENDER_DETAIL_COPY } from "../_consts/render-detail";

import type { AccountRenderDetail } from "@/types/api/account";

const COUNT_METRICS: {
  labelKey: keyof typeof BUNDLES_RENDER_DETAIL_COPY;
  value: (render: AccountRenderDetail) => string;
}[] = [
  { labelKey: "downloadsCountLabel", value: (r) => String(r.downloads_count) },
  { labelKey: "gameResultsLabel", value: (r) => String(r.game_results_in_renders_count) },
  { labelKey: "upcomingGamesLabel", value: (r) => String(r.upcoming_games_in_renders_count) },
  { labelKey: "gradesLabel", value: (r) => String(r.grades_in_renders_count) },
  { labelKey: "aiArticlesLabel", value: (r) => String(r.ai_articles_count) },
];

/** Compact summary — matches delivery schedule / list inset sections on the bundles index. */
export function BundlesRenderDetailSummary({ render }: { render: AccountRenderDetail }) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <TypographyBodySmall className="font-semibold">
        {BUNDLES_RENDER_DETAIL_COPY.summaryTitle}
      </TypographyBodySmall>
      <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-3 text-sm">
        {COUNT_METRICS.map(({ labelKey, value }) => (
          <div key={labelKey} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground text-xs">
              {BUNDLES_RENDER_DETAIL_COPY[labelKey]}
            </dt>
            <dd className="font-semibold tabular-nums">{value(render)}</dd>
          </div>
        ))}
      </dl>
    </SectionBlock>
  );
}
