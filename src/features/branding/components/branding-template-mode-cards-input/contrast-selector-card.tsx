"use client";

import { Contrast } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";

import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "../branding-container-header-title";
import { CONTRAST_SELECTOR_BYLINE_COPY } from "./_consts";

import type { ContrastSelectorCardProps } from "./_types";

export function ContrastSelectorCard({
  headerDescription,
  children,
  footer,
}: ContrastSelectorCardProps) {
  return (
    <MetricComparisonCard
      className="ring-border w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
      layout="card"
      headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
      titleRowClassName="items-start"
      title={
        <BrandingContainerHeaderTitle
          icon={<Contrast className="size-5" aria-hidden />}
          title="2. Contrast selector"
          description={CONTRAST_SELECTOR_BYLINE_COPY}
        />
      }
      body={
        <div className="space-y-5">
          {headerDescription ? <div className="space-y-3">{headerDescription}</div> : null}
          {children}
        </div>
      }
      footer={footer}
    />
  );
}
