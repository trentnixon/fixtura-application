"use client";

import { Building2, UsersRound } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { InlineAlert } from "@/components/auth/actions";
import { TypographyFinePrint } from "@/components/typography";
import { GridCard, GridCardIcon } from "@/components/ui/grid-card";
import { Label } from "@/components/ui/label";
import { DependentFieldTrigger, SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/client/api-error";
import {
  useAccountSettings,
  isAccountSettingsGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useOnboardingLookupAssociations } from "@/lib/api/hooks/account/useOnboardingLookupAssociations";
import { useOnboardingLookupClubs } from "@/lib/api/hooks/account/useOnboardingLookupClubs";
import { useOnboardingLookupOrganisationTypes } from "@/lib/api/hooks/account/useOnboardingLookupOrganisationTypes";
import { useUpdateOnboardingStep1 } from "@/lib/api/hooks/account/useUpdateOnboardingStep1";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { OnboardingSection } from "./onboarding-section";

export type WizardStepOrganisationHandle = {
  submit: () => Promise<void>;
};

type WizardStepOrganisationProps = {
  accountId: string;
  /** Sport id from Getting Started (L1). If empty, falls back to persisted settings when loaded. */
  sportId: string;
  onContinue: () => void;
  onPendingChange?: (pending: boolean) => void;
};

function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) {
    const d = e.details;
    if (typeof d === "object" && d !== null && "error" in d) {
      const err = (d as { error?: { message?: string } }).error;
      if (typeof err?.message === "string" && err.message.trim()) return err.message;
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong. Try again.";
}

export const WizardStepOrganisation = forwardRef<
  WizardStepOrganisationHandle,
  WizardStepOrganisationProps
>(function WizardStepOrganisation({ accountId, sportId, onContinue, onPendingChange }, ref) {
  const orgTypesQuery = useOnboardingLookupOrganisationTypes();
  const settingsQuery = useAccountSettings(accountId, { enabled: Boolean(accountId) });
  const updateStep1 = useUpdateOnboardingStep1(accountId);

  const [accountTypeId, setAccountTypeId] = useState<number | "">("");
  const [associationId, setAssociationId] = useState<number | "">("");
  const [clubId, setClubId] = useState<number | "">("");
  const [isRightsHolder, setIsRightsHolder] = useState(false);
  const [isPermissionGiven, setIsPermissionGiven] = useState(false);
  const hydratedRef = useRef(false);
  const prevSportRef = useRef<string | undefined>(undefined);
  const orgTypeSectionId = useId();
  const associationSectionId = useId();
  const permissionSectionId = useId();

  const settingsPayload = useMemo(() => {
    const q = settingsQuery.data;
    if (!q || isAccountSettingsGatewayRedirect(q)) return undefined;
    return q.data;
  }, [settingsQuery.data]);

  /** Prop wins when set; otherwise persisted settings (e.g. future deep links). */
  const sport = useMemo(() => {
    const fromProp = sportId.trim();
    if (fromProp) return fromProp;
    return settingsPayload?.Sport?.trim() ?? "";
  }, [sportId, settingsPayload?.Sport]);

  useEffect(() => {
    if (!settingsPayload || hydratedRef.current) return;
    hydratedRef.current = true;
    if (settingsPayload.account_type != null) {
      setAccountTypeId(settingsPayload.account_type);
    }
    setIsRightsHolder(Boolean(settingsPayload.isRightsHolder));
    setIsPermissionGiven(Boolean(settingsPayload.isPermissionGiven));
  }, [settingsPayload]);

  const sportReady = Boolean(sport.trim());

  const associationsQuery = useOnboardingLookupAssociations(sport, { enabled: sportReady });
  const associations = useMemo(() => associationsQuery.data?.data ?? [], [associationsQuery.data]);

  const isClubAccountType = accountTypeId !== "" && Number(accountTypeId) === CLUB_ACCOUNT_TYPE_ID;

  const associationNumeric =
    associationId === ""
      ? null
      : typeof associationId === "number"
        ? associationId
        : Number(associationId);

  const clubsQuery = useOnboardingLookupClubs(associationNumeric, {
    enabled:
      sportReady && isClubAccountType && associationNumeric != null && associationNumeric > 0,
  });
  const clubs = useMemo(() => clubsQuery.data?.data ?? [], [clubsQuery.data]);

  const associationOptions = useMemo(
    () => associations.map((a) => ({ value: String(a.id), label: a.label })),
    [associations],
  );

  const clubOptions = useMemo(
    () => clubs.map((c) => ({ value: String(c.id), label: c.label })),
    [clubs],
  );

  /** Reset association/club when the effective sport changes (e.g. user went back and picked another sport). */
  useEffect(() => {
    const prev = prevSportRef.current;
    if (prev !== undefined && prev !== sport && prev !== "") {
      setAssociationId("");
      setClubId("");
    }
    prevSportRef.current = sport;
  }, [sport]);

  useEffect(() => {
    setClubId("");
  }, [associationId]);

  useEffect(() => {
    if (!isClubAccountType) setClubId("");
  }, [isClubAccountType]);

  useEffect(() => {
    onPendingChange?.(updateStep1.isPending);
  }, [updateStep1.isPending, onPendingChange]);

  const orgTypes = orgTypesQuery.data?.data ?? [];

  const disabledUntilSport = !sportReady;

  const resolvedOrganisationName = useMemo(() => {
    if (associationId === "") return "";
    const aid = typeof associationId === "number" ? associationId : Number(associationId);
    const assoc = associations.find((a) => a.id === aid);
    if (isClubAccountType) {
      if (clubId === "") return "";
      const cid = typeof clubId === "number" ? clubId : Number(clubId);
      const club = clubs.find((c) => c.id === cid);
      return club?.label?.trim() ?? "";
    }
    return assoc?.label?.trim() ?? "";
  }, [associationId, clubId, associations, clubs, isClubAccountType]);

  const validate = useCallback((): string | null => {
    if (!sport.trim()) return "Choose a sport.";
    if (accountTypeId === "") return "Choose an organisation type.";
    if (associationId === "") return "Choose an association.";
    if (isClubAccountType && clubId === "") return "Choose a club.";
    if (!resolvedOrganisationName)
      return "Organisation name could not be determined from your selection.";
    if (resolvedOrganisationName.length > 255)
      return "Organisation name must be 255 characters or less.";
    if (!isRightsHolder) return "Confirm you are authorised to act for this organisation.";
    if (!isPermissionGiven)
      return "Confirm permission for Fixtura to fetch and prepare organisation data.";
    return null;
  }, [
    sport,
    accountTypeId,
    associationId,
    clubId,
    resolvedOrganisationName,
    isRightsHolder,
    isPermissionGiven,
    isClubAccountType,
  ]);

  const submit = useCallback(async () => {
    const v = validate();
    if (v) {
      toast.error(v);
      return;
    }
    if (accountTypeId === "" || associationId === "") return;
    try {
      const aid = typeof associationId === "number" ? associationId : Number(associationId);
      const body: Parameters<typeof updateStep1.mutateAsync>[0] = {
        sport: sport.trim(),
        accountTypeId: typeof accountTypeId === "number" ? accountTypeId : Number(accountTypeId),
        onboardingOrganisationName: resolvedOrganisationName,
        isRightsHolder,
        isPermissionGiven,
        associationId: aid,
        clubId:
          isClubAccountType && clubId !== ""
            ? typeof clubId === "number"
              ? clubId
              : Number(clubId)
            : null,
      };
      await updateStep1.mutateAsync(body);
      onContinue();
    } catch (e) {
      toast.error(errorMessageFromUnknown(e));
    }
  }, [
    validate,
    updateStep1,
    sport,
    accountTypeId,
    associationId,
    clubId,
    resolvedOrganisationName,
    isRightsHolder,
    isPermissionGiven,
    isClubAccountType,
    onContinue,
  ]);

  useImperativeHandle(ref, () => ({ submit }), [submit]);

  const lookupsError = orgTypesQuery.isError
    ? "We could not load organisation types. Refresh the page or try again later."
    : null;

  const associationsError =
    sportReady && associationsQuery.isError
      ? "We could not load associations for this sport. Try again or pick another sport."
      : null;

  const associationsEmpty =
    sportReady && associationsQuery.isSuccess && associations.length === 0
      ? "No associations are available for this sport yet."
      : null;

  const clubsError =
    sportReady && isClubAccountType && associationNumeric != null && clubsQuery.isError
      ? "We could not load clubs for this association. Try again."
      : null;

  const onAssociationSelect = (v: string) => {
    if (!v) {
      setAssociationId("");
      return;
    }
    setAssociationId(Number(v));
  };

  const onClubSelect = (v: string) => {
    if (!v) {
      setClubId("");
      return;
    }
    setClubId(Number(v));
  };

  const noopOnString = useCallback((_v: string) => {}, []);

  const associationLoading = sportReady && associationsQuery.isPending;
  const associationComboDisabled =
    disabledUntilSport ||
    (!associationsQuery.isPending &&
      (associationsQuery.isError || (associationsQuery.isSuccess && associations.length === 0)));

  return (
    <div className="flex flex-col gap-6">
      {lookupsError ? <InlineAlert message={lookupsError} variant="destructive" /> : null}
      {associationsError ? <InlineAlert message={associationsError} variant="destructive" /> : null}
      {associationsEmpty ? <InlineAlert message={associationsEmpty} variant="warning" /> : null}
      {clubsError ? <InlineAlert message={clubsError} variant="destructive" /> : null}

      <OnboardingSection title="Organisation type" titleId={orgTypeSectionId}>
        {orgTypesQuery.isPending ? (
          <TypographyFinePrint className="text-muted-foreground text-center">
            Loading organisation types…
          </TypographyFinePrint>
        ) : orgTypes.length === 0 ? (
          <TypographyFinePrint className="text-muted-foreground text-center">
            No organisation types are available yet.
          </TypographyFinePrint>
        ) : (
          <div
            role="radiogroup"
            aria-labelledby={orgTypeSectionId}
            className="flex flex-wrap items-stretch justify-center gap-4"
          >
            {orgTypes.map((t) => {
              const selected = accountTypeId !== "" && accountTypeId === t.id;
              const cardDisabled = disabledUntilSport;
              const OrgTypeIcon = t.id === CLUB_ACCOUNT_TYPE_ID ? UsersRound : Building2;
              return (
                <GridCard
                  key={t.id}
                  className="mx-0 h-full min-h-0 w-full"
                  title={t.label}
                  ctaLabel={selected ? "Selected" : "Select"}
                  visual={<GridCardIcon icon={OrgTypeIcon} />}
                  tone={selected ? "success" : "default"}
                  disabled={cardDisabled}
                  onClick={() => {
                    if (!cardDisabled) setAccountTypeId(t.id);
                  }}
                />
              );
            })}
          </div>
        )}
      </OnboardingSection>

      <OnboardingSection title="Association and club" titleId={associationSectionId}>
        <TypographyFinePrint className="text-muted-foreground">
          Choose the association for this sport. Clubs are listed after you pick an association when
          your organisation type is a club.
        </TypographyFinePrint>
        <div className="grid gap-2">
          <Label htmlFor="onboarding-association">Association</Label>
          {associationLoading ? (
            <SearchableCombobox
              id="onboarding-association"
              options={[]}
              value={null}
              onChange={noopOnString}
              placeholder=""
              loading
              loadingMessage="Loading associations…"
            />
          ) : (
            <SearchableCombobox
              id="onboarding-association"
              options={associationOptions}
              value={associationId === "" ? null : String(associationId)}
              onChange={onAssociationSelect}
              disabled={associationComboDisabled}
              placeholder={
                disabledUntilSport
                  ? "Loading…"
                  : associationsQuery.isError
                    ? "Unable to load associations"
                    : associations.length === 0
                      ? "No associations"
                      : "Search associations…"
              }
              emptyText="No association matches."
            />
          )}
        </div>

        {isClubAccountType ? (
          <div className="grid gap-2">
            <Label htmlFor="onboarding-club">Club</Label>
            {associationId === "" ? (
              <DependentFieldTrigger id="onboarding-club" message="Select an association first" />
            ) : clubsQuery.isPending ? (
              <SearchableCombobox
                id="onboarding-club"
                options={[]}
                value={null}
                onChange={noopOnString}
                placeholder=""
                loading
                loadingMessage="Fetching clubs…"
              />
            ) : clubsQuery.isError ? (
              <SearchableCombobox
                id="onboarding-club"
                options={[]}
                value={clubId === "" ? null : String(clubId)}
                onChange={onClubSelect}
                disabled
                placeholder="Unable to load clubs"
                emptyText="No clubs available."
              />
            ) : (
              <SearchableCombobox
                id="onboarding-club"
                options={clubOptions}
                value={clubId === "" ? null : String(clubId)}
                onChange={onClubSelect}
                disabled={disabledUntilSport}
                placeholder="Search clubs…"
                emptyText="No clubs for this association."
              />
            )}
          </div>
        ) : null}

        {resolvedOrganisationName ? (
          <div className="border-border/60 bg-muted/30 rounded-md border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Organisation name: </span>
            <span className="font-medium">{resolvedOrganisationName}</span>
          </div>
        ) : null}
      </OnboardingSection>

      <OnboardingSection title="Permission and authority" titleId={permissionSectionId}>
        <div className="flex items-start gap-3">
          <Switch
            id="onboarding-rights"
            checked={isRightsHolder}
            onCheckedChange={setIsRightsHolder}
            disabled={disabledUntilSport}
            className="mt-0.5 shrink-0"
          />
          <Label htmlFor="onboarding-rights" className="leading-snug font-normal">
            I am authorised to act for this organisation in Fixtura.
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Switch
            id="onboarding-permission"
            checked={isPermissionGiven}
            onCheckedChange={setIsPermissionGiven}
            disabled={disabledUntilSport}
            className="mt-0.5 shrink-0"
          />
          <Label htmlFor="onboarding-permission" className="leading-snug font-normal">
            I give Fixtura permission to fetch and prepare this organisation&apos;s data so we can
            get ready to use the product.
          </Label>
        </div>
      </OnboardingSection>
    </div>
  );
});

WizardStepOrganisation.displayName = "WizardStepOrganisation";
