import { SessionApiCallout } from "@/components/auth/session-api-callout";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export default function AppHomePage() {
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
      <div className="pt-8">
        <SessionApiCallout />
      </div>
    </>
  );
}
