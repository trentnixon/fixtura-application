import { ErrorState } from "@/components/ui/error-state";

export function ManageSponsorsErrorState({
  description,
  onRetry,
}: {
  description: string;
  onRetry: () => void;
}) {
  return (
    <ErrorState
      title="Could not load sponsor workspace"
      description={description}
      onRetry={onRetry}
    />
  );
}
