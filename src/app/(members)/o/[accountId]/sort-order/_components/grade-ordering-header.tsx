"use client";

import { PageHeader } from "@/components/ui/container";

export function GradeOrderingHeader({
  organisationName,
  revision,
}: {
  organisationName: string;
  revision: number;
}) {
  return (
    <PageHeader
      title="Sort Order"
      description={`Arrange grades for ${organisationName}. Revision ${revision}.`}
    />
  );
}
