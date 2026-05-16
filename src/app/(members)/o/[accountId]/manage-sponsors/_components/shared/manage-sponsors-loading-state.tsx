import { BrandedLoader } from "@/components/ui/branded-loader";

export function ManageSponsorsLoadingState() {
  return (
    <div className="rounded-xl border border-dashed p-10">
      <BrandedLoader label="Loading sponsor workspace" />
    </div>
  );
}
