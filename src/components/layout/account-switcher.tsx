"use client";

import { IconBuilding, IconChevronDown, IconList } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

export function AccountSwitcher({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { data: meData } = useAccountMe();
  const accounts = meData?.data?.accounts ?? [];
  const currentLabel =
    accounts.find((a) => String(a.id) === accountId)?.contentHub?.accountOrganisationDetails
      ?.Name ?? `Account ${accountId}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="mb-2 h-9 w-full justify-between gap-1 px-2 text-left font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <IconBuilding className="size-4 shrink-0 opacity-70" />
            <span className="truncate text-sm">{currentLabel}</span>
          </span>
          <IconChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        align="start"
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Switch organisation
        </DropdownMenuLabel>
        {accounts.length > 0 ? (
          accounts.map((a) => {
            const id = String(a.id);
            const name = a.contentHub?.accountOrganisationDetails?.Name ?? `Account ${id}`;
            return (
              <DropdownMenuItem
                key={id}
                disabled={id === accountId}
                onSelect={() => {
                  router.push(accountScopedRoutes.dashboard(id));
                }}
              >
                {name}
              </DropdownMenuItem>
            );
          })
        ) : (
          <DropdownMenuItem disabled>No other accounts loaded</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.selectOrganisation} className="flex cursor-pointer items-center gap-2">
            <IconList className="size-4 opacity-70" />
            All organisations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
