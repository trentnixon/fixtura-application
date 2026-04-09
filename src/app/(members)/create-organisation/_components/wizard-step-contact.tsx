"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import {
  useAccountSettings,
  isAccountSettingsGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useUpdateOnboardingStep3 } from "@/lib/api/hooks/account/useUpdateOnboardingStep3";
import { useCurrentUser } from "@/lib/api/hooks/auth/useCurrentUser";
import { ROUTES } from "@/lib/config/routes";

import { OnboardingSection } from "./onboarding-section";

import type { UpdateOnboardingStep3Body } from "@/types/api/account";

/** Align with Strapi W3 validation ([cms-response-phase4-w3-contact-and-delivery.md](../.comms/phase-4/cms-response-phase4-w3-contact-and-delivery.md)). */
const W3_MAX_NAME = 255;
/** Stored in `deliveryAddress`; used for weekly asset delivery email (not a postal address). */
const MAX_ASSETS_DELIVERY_EMAIL = 320;

export type WizardStepContactHandle = {
  submit: () => Promise<void>;
};

type WizardStepContactProps = {
  accountId: string;
  onContinue: () => void;
  onPendingChange?: (pending: boolean) => void;
};

function normalizeField(value: string | null | undefined): string {
  return value == null ? "" : String(value).trim();
}

/** Rejects obvious non-emails; not a full RFC 5322 check. */
function isPlausibleEmail(value: string): boolean {
  if (value.length > MAX_ASSETS_DELIVERY_EMAIL) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactStep(firstName: string, assetsDeliveryEmail: string): string | null {
  const nf = normalizeField(firstName);
  if (!nf) return "Enter a first name.";
  const nd = normalizeField(assetsDeliveryEmail);
  if (!nd) return "Enter an email for weekly assets.";
  if (!isPlausibleEmail(nd)) return "Enter a valid email address for weekly assets.";
  return null;
}

function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      const d = e.details;
      if (typeof d === "object" && d !== null && "error" in d) {
        const err = (d as { error?: { message?: string } }).error;
        if (typeof err?.message === "string" && err.message.trim()) return err.message;
      }
      return "This account or your sign-in details changed. Refresh the page or go back to organisation selection.";
    }
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

export const WizardStepContact = forwardRef<WizardStepContactHandle, WizardStepContactProps>(
  function WizardStepContact({ accountId, onContinue, onPendingChange }, ref) {
    const settingsQuery = useAccountSettings(accountId, { enabled: Boolean(accountId) });
    const authUserQuery = useCurrentUser();
    const updateStep3 = useUpdateOnboardingStep3(accountId);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    /** Weekly assets delivery email (API field `deliveryAddress`). */
    const [assetsDeliveryEmail, setAssetsDeliveryEmail] = useState("");
    const hydratedRef = useRef(false);
    const initialRef = useRef({ firstName: "", lastName: "", assetsDeliveryEmail: "" });
    const contactNameSectionId = useId();
    const deliverySectionId = useId();

    useEffect(() => {
      const loadingSettings = settingsQuery.isPending && !settingsQuery.data;
      onPendingChange?.(updateStep3.isPending || loadingSettings);
    }, [settingsQuery.isPending, settingsQuery.data, updateStep3.isPending, onPendingChange]);

    const settingsPayload = useMemo(() => {
      const q = settingsQuery.data;
      if (!q || isAccountSettingsGatewayRedirect(q)) return undefined;
      return q.data;
    }, [settingsQuery.data]);

    useEffect(() => {
      if (!settingsPayload || hydratedRef.current) return;
      hydratedRef.current = true;
      const f = normalizeField(settingsPayload.FirstName);
      const l = normalizeField(settingsPayload.LastName);
      const d = normalizeField(settingsPayload.DeliveryAddress);
      initialRef.current = { firstName: f, lastName: l, assetsDeliveryEmail: d };
      setFirstName(settingsPayload.FirstName ?? "");
      setLastName(settingsPayload.LastName ?? "");
      setAssetsDeliveryEmail(settingsPayload.DeliveryAddress ?? "");
    }, [settingsPayload]);

    const gatewayRedirect =
      settingsQuery.data && isAccountSettingsGatewayRedirect(settingsQuery.data)
        ? settingsQuery.data
        : null;

    const dirty = useMemo(() => {
      const init = initialRef.current;
      return (
        normalizeField(firstName) !== init.firstName ||
        normalizeField(lastName) !== init.lastName ||
        normalizeField(assetsDeliveryEmail) !== init.assetsDeliveryEmail
      );
    }, [firstName, lastName, assetsDeliveryEmail]);

    const emailDisplay = authUserQuery.data?.user.email?.trim() ?? "";

    const submit = useCallback(async () => {
      if (gatewayRedirect) return;
      if (!settingsPayload) return;

      const clientErr = validateContactStep(firstName, assetsDeliveryEmail);
      if (clientErr) {
        toast.error(clientErr);
        return;
      }

      const nf = normalizeField(firstName);
      const nl = normalizeField(lastName);
      const nd = normalizeField(assetsDeliveryEmail);

      if (!dirty) {
        onContinue();
        return;
      }

      const body: UpdateOnboardingStep3Body = {};
      const init = initialRef.current;
      if (nf !== init.firstName) body.firstName = nf || null;
      if (nl !== init.lastName) body.lastName = nl || null;
      if (nd !== init.assetsDeliveryEmail) body.deliveryAddress = nd || null;

      if (Object.keys(body).length === 0) {
        onContinue();
        return;
      }

      try {
        await updateStep3.mutateAsync(body);
        initialRef.current = {
          firstName: nf,
          lastName: nl,
          assetsDeliveryEmail: nd,
        };
        onContinue();
      } catch (e) {
        toast.error(errorMessageFromUnknown(e));
      }
    }, [
      gatewayRedirect,
      settingsPayload,
      dirty,
      firstName,
      lastName,
      assetsDeliveryEmail,
      updateStep3,
      onContinue,
    ]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    if (gatewayRedirect) {
      return (
        <div className="flex flex-col gap-4">
          <InlineAlert
            message="We could not load settings for this account. Return to organisation selection and try again."
            variant="destructive"
          />
          <Link
            href={ROUTES.selectOrganisation}
            className="text-primary text-sm font-medium underline underline-offset-4"
          >
            Back to organisation selection
          </Link>
        </div>
      );
    }

    if (settingsQuery.isPending && !settingsQuery.data) {
      return (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Loading contact details…
        </p>
      );
    }

    if (settingsQuery.isError) {
      return (
        <InlineAlert
          message="We could not load settings. Check your connection and try again."
          variant="destructive"
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <OnboardingSection title="Contact name" titleId={contactNameSectionId}>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contact-first-name">First name</Label>
              <Input
                id="contact-first-name"
                autoComplete="given-name"
                maxLength={W3_MAX_NAME}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-last-name">Last name</Label>
              <Input
                id="contact-last-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </OnboardingSection>
        <OnboardingSection title="Weekly assets email" titleId={deliverySectionId}>
          <div className="grid gap-2">
            <TypographyFinePrint className="text-muted-foreground">
              Enter the email address you would like the assets delivered to each week.
            </TypographyFinePrint>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor="contact-assets-delivery-email">Email for weekly assets</Label>
                <Input
                  id="contact-assets-delivery-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={MAX_ASSETS_DELIVERY_EMAIL}
                  value={assetsDeliveryEmail}
                  onChange={(e) => setAssetsDeliveryEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 sm:mb-0.5"
                disabled={!emailDisplay}
                onClick={() => setAssetsDeliveryEmail(emailDisplay)}
              >
                Send to Me
              </Button>
            </div>
            <TypographyFinePrint className="text-muted-foreground">
              This can differ from your sign-in email if you want weekly assets sent somewhere else.
            </TypographyFinePrint>
          </div>
        </OnboardingSection>
      </div>
    );
  },
);
