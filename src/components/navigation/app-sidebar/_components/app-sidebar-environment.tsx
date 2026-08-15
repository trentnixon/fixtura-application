"use client";

import { Badge } from "@/components/ui/badge";
import { SidebarFooter } from "@/components/ui/sidebar";
import {
  getAppSidebarEnvironmentLabel,
  getPublicEnvironment,
  isProductionEnvironment,
} from "@/lib/config/public-environment";

export function AppSidebarEnvironment() {
  const environment = getPublicEnvironment();
  if (!environment) return null;

  const label = getAppSidebarEnvironmentLabel(environment);
  const isProduction = isProductionEnvironment(environment);

  return (
    <SidebarFooter>
      <Badge
        variant="outline"
        className={
          isProduction ? "w-full justify-center" : "w-full justify-center font-mono uppercase"
        }
      >
        {label}
      </Badge>
    </SidebarFooter>
  );
}
