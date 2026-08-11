export function SponsorEntityAssignmentRedirect({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-muted-foreground text-sm">Sponsor entity targets redirected: {reason}</p>
    </div>
  );
}
