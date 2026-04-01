import { SessionApiCallout } from "@/components/auth/session-api-callout";

export default function AppHomePage() {
  return (
    <div className="grid gap-2">
      <h1 className="font-brand text-xl font-semibold">Home</h1>
      <p className="text-muted-foreground text-sm">Placeholder protected page for `/app/home`.</p>
      <SessionApiCallout />
    </div>
  );
}
