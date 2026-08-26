"use client";

import { PageHeader } from "@/components/ui/container";

export function GradeOrderingHeader({ organisationName }: { organisationName: string }) {
  return (
    <PageHeader title="Sort Order" description={`Set the grade order for ${organisationName}.`} />
  );
}
