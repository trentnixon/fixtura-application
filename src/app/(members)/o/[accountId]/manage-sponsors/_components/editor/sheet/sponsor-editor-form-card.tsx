"use client";

import { Image } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";

import { SponsorEditorLogoUploadBlock } from "../sponsor-editor-logo-upload-block";
import { SponsorEditorNameFieldsBlock } from "../sponsor-editor-name-fields-block";
import { SponsorEditorActions } from "./sponsor-editor-actions";

import type { SponsorEditorFormCardProps } from "../../../_types/sponsor-editor";

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
        className="min-w-0 shadow-sm"
        layout="card"
        title="Sponsor logo"
        icon={<Image className="text-primary size-5 shrink-0" aria-hidden />}
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
              <div className="grid min-w-0 gap-6 md:grid-cols-12">
                <div className="grid min-w-0 md:col-span-7">
                  <SponsorEditorLogoUploadBlock
                    savedLogoUrl={savedLogoUrl}
                    clearLogo={clearLogo}
                    logoChangeKind={logoChangeKind}
                    showFileFormatCallout={isCreateMode}
                    onLogoCropComplete={onLogoCropComplete}
                    onLogoReset={onLogoReset}
                  />
                </div>

                <div className="grid min-w-0 content-start md:col-span-5">
                  <SponsorEditorNameFieldsBlock
                    sponsor={sponsor}
                    name={name}
                    onNameChange={onNameChange}
                    isActive={isActive}
                    onActiveChange={onActiveChange}
                  />
                </div>
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
