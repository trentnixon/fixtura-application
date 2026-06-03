"use client";

import { Image } from "lucide-react";

import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-container-header-title";
import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";

import { SponsorEditorLogoUploadBlock } from "../sponsor-editor-logo-upload-block";
import { SponsorEditorNameFieldsBlock } from "../sponsor-editor-name-fields-block";
import { SponsorEditorActions } from "./sponsor-editor-actions";

import type { SponsorEditorFormCardProps } from "../../_types/sponsor-editor";

export function SponsorEditorFormCard({
  sponsor,
  name,
  onNameChange,
  isActive,
  onActiveChange,
  savedLogoUrl,
  clearLogo,
  logoChangeKind,
  isCreateMode,
  isEditMode,
  isDirty,
  confirmedAt,
  isArchiving,
  onLogoCropComplete,
  onLogoReset,
  onArchiveClick,
  onSaveClick,
}: SponsorEditorFormCardProps) {
  return (
    <section className="grid gap-4">
      <MetricComparisonCard
        className="ring-border min-w-0 rounded-2xl border-none shadow-xl ring-1"
        layout="card"
        headerClassName={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}
        title={
          <ManageSponsorsContainerHeaderTitle
            icon={<Image className="size-5" aria-hidden />}
            title="Sponsor logo"
            description="Upload, crop, and name the sponsor so it can be used across placements."
          />
        }
        body={
          <div className="space-y-6">
            <p className="text-sm leading-relaxed">
              Upload a sponsor logo, choose an aspect ratio, and crop it so it displays cleanly
              across your account experience.
            </p>

            {isEditMode ? (
              <div className="grid min-w-0 gap-6">
                <SponsorEditorLogoUploadBlock
                  savedLogoUrl={savedLogoUrl}
                  clearLogo={clearLogo}
                  logoChangeKind={logoChangeKind}
                  showFileFormatCallout={isCreateMode}
                  onLogoCropComplete={onLogoCropComplete}
                  onLogoReset={onLogoReset}
                />
                <SponsorEditorNameFieldsBlock
                  sponsor={sponsor}
                  name={name}
                  onNameChange={onNameChange}
                  isActive={isActive}
                  onActiveChange={onActiveChange}
                />
              </div>
            ) : (
              <div className="grid min-w-0 gap-6">
                <SponsorEditorLogoUploadBlock
                  savedLogoUrl={savedLogoUrl}
                  clearLogo={clearLogo}
                  logoChangeKind={logoChangeKind}
                  showFileFormatCallout={isCreateMode}
                  onLogoCropComplete={onLogoCropComplete}
                  onLogoReset={onLogoReset}
                />
                <SponsorEditorNameFieldsBlock
                  sponsor={sponsor}
                  name={name}
                  onNameChange={onNameChange}
                  isActive={isActive}
                  onActiveChange={onActiveChange}
                />
              </div>
            )}

            <SponsorEditorActions
              sponsor={sponsor}
              isCreateMode={isCreateMode}
              isDirty={isDirty}
              confirmedAt={confirmedAt}
              isArchiving={isArchiving}
              onArchiveClick={onArchiveClick}
              onSaveClick={onSaveClick}
            />
          </div>
        }
        footer={
          <TypographyMuted className="text-xs leading-relaxed">
            Match the crop ratio to sponsor placements, exports, and how the logo appears across
            your account.
          </TypographyMuted>
        }
      />
    </section>
  );
}
