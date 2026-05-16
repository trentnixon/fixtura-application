export function SponsorEntityAssignmentError({ error }: { error: unknown }) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Could not load sponsor entity targets."}
      </p>
    </div>
  );
}
