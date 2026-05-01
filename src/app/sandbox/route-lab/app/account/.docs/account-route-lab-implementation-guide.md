# Account Route Lab Implementation Guide

Date: 2026-05-01

## Goal

Plan and implement the new account page first in Route Lab:

```txt
/sandbox/route-lab/app/account
```

Production target:

```txt
/o/[accountId]/account
```

This page should become the user's account and organisation membership profile. It should group the old account details into clear sections, model view/edit behavior with local fixtures, and reuse the existing Route Lab and kitchen-sink component language. Do not connect to CMS or add real persistence in this lab pass.

## Current Route Shape

Existing lab files:

- `src/app/sandbox/route-lab/app/account/page.tsx`
- `src/app/sandbox/route-lab/app/account/_components/account-lab-workspace.tsx`
- `src/app/sandbox/route-lab/app/account/.docs/`

The lab page already uses:

- `RouteLabPage`
- `getScenario`
- `accountScopedRoutes.account(DEMO_ACCOUNT_ID)`
- loading and error states through `BrandedLoader` and `ErrorState`

The workspace is fixture-driven (`account-lab-workspace.tsx`). Use it for scenarios and copy exploration; production consumes live data in `account-security-content.tsx`.

Existing production route:

- `src/app/(members)/o/[accountId]/account/page.tsx`
- Client: `_components/account-security-content.tsx` (live CMS: settings, organisation context, `/me`, security mutations).

**Production parity:** The members account page mirrors this guide’s IA: `PageHeader` + badges, two-column shells (sign-in/security vs overview & organisation access), setup-pending banner, and read-only organisation authority rows. The Route Lab remains the sandbox for **fixture-only** scenarios (`state`/`mode`/stubs) and further UX exploration.

## Old Account Data

Old version fields:

```txt
isSetup: Yes
isRightsHolder: Yes
isPermissionGiven: Yes

Authentication Details
Status: Active
User Name: Cricket Whanganui
Login Email: trentnixon+cw@gmail.com
Password: ********
Member Since: 14 October 2025
Last Updated: 8 March 2026

Bundle Details
Sport: Cricket
Account Type: Association
Organization(s): Cricket Whanganui
Bundle Addressed To: Cricket Whanganui
Delivery Email: trentnixon+cw@gmail.com
Asset Delivery Day: Sunday
```

## Recommended Information Architecture

### 1. Account Overview

Purpose: Give the user immediate confidence they are in the right account.

Fields:

- Organisation display name: `Cricket Whanganui`
- Account status: `Active`
- Sport: `Cricket`
- Account type: `Association`
- Setup status: `Setup complete`

UI:

- Use `PageHeader` from `@/components/ui/container`.
- Under the header, use compact status cards or badges for the most important account state.
- Use `card.metric.inline-*` and `card.feedback.soft.*` patterns from kitchen sink as references, but keep this page quieter than a dashboard.

Notes:

- `isSetup` should be presented as "Setup complete" / "Setup pending", not as raw boolean text.
- `isActive` should be presented as "Active" / "Inactive".
- If `isSetup=false`, show a soft warning/info row that links conceptually to setup/onboarding, but keep navigation as a lab stub.

### 2. Sign-In And Security

Purpose: Explain how the user signs in and provide password/security controls.

Fields:

- User name: `Cricket Whanganui`
- Login email: `trentnixon+cw@gmail.com`
- Password: masked display only
- Member since: `14 October 2025`
- Last updated: `8 March 2026`

Editable items:

- Login email, if we choose to model an email update flow later.
- Password via `ChangePasswordForm` in production, but in Route Lab use a stubbed local interaction or a disabled/password panel until the production form is intentionally restyled.

UI:

- Use a `Surface` or `Card` with a strong section header.
- Show read-only profile rows in a definition-list style.
- Add a "Change password" action that opens a dialog in the lab, or place a stub password form in an expandable panel.
- For the lab, no POST to `/api/accounts/:accountId/security/password` should run.

Notes:

- Do not expose the real password field. Show only `********` or "Password set".
- Keep auth/security copy crisp and trust-focused.
- If using password fields in the lab, validate locally only and show `toast.success("Route lab: password not changed")`.

### 3. Organisation Access

Purpose: Group rights and permission flags away from generic account status.

Fields:

- Rights holder: `Yes`
- Permission given: `Yes`
- Organisation(s): `Cricket Whanganui`

Editable items:

- Rights holder acknowledgement.
- Permission confirmation.

UI:

- Use settings-style rows from `SettingsLabWorkspace`: label, description, right-side value/control.
- In `mode=view`, show values as status badges or simple Yes/No rows.
- In `mode=edit`, use `Switch` controls for boolean flags.

Notes:

- These flags are not the same as authentication status. Keep them in their own section.
- Copy should frame this as organisation authority: "You are authorised to manage assets for this organisation."

### 4. Bundle Delivery Profile

Purpose: Show where generated assets are addressed and sent.

Fields:

- Bundle addressed to: `Cricket Whanganui`
- Delivery email: `trentnixon+cw@gmail.com`
- Asset delivery day: `Sunday`

Editable items:

- Bundle addressed to.
- Delivery email.
- Asset delivery day.

UI:

- Use a compact settings surface with inputs/selects.
- Use existing weekday helpers from `@/features/settings/bundle-delivery-weekdays`:
  - `WEEKDAY_OPTIONS`
  - `weekdayLabel`
  - `daysUntilNextDelivery`
- The delivery day control should match the Settings lab select pattern.

Notes:

- "Asset Delivery Day" belongs here rather than under generic bundle details.
- Consider helper text like "Weekly generated assets are delivered on this day."

### 5. Save And Review

Purpose: Let Route Lab model edit/save behavior without a backend.

Behavior:

- Add `modeOptions={["view", "edit"]}` to the account route.
- Add `stateOptions={["default", "saving", "loading", "error", "setup-pending", "inactive"]}`.
- `state=saving` should disable controls and show "Saving..." on the save action.
- Save opens a confirmation dialog with a summary of changed fields.
- Confirm save shows a toast and local "Confirmed at HH:mm:ss" feedback.
- Reset returns the draft to the fixture.

Do not:

- Add CMS calls.
- Add BFF routes.
- POST to members account security endpoints (`/api/accounts/:accountId/security/*`) from the lab.
- Change production route behavior in this first lab pass.

## Fixture Shape

Create local fixtures in the account lab workspace first. If the file grows, move them to:

```txt
src/features/route-lab/fixtures/account.ts
```

Suggested fixture:

```ts
type AccountLabData = {
  id: string;
  organisationName: string;
  isActive: boolean;
  isSetup: boolean;
  isRightsHolder: boolean;
  isPermissionGiven: boolean;
  userName: string;
  loginEmail: string;
  memberSince: string;
  lastUpdated: string;
  sport: string;
  accountType: "Association" | "Club";
  organisations: string[];
  bundleAddressedTo: string;
  deliveryEmail: string;
  assetDeliveryDay: WeekdayKey;
};
```

Default fixture:

```ts
const ACCOUNT_LAB_DEFAULT: AccountLabData = {
  id: "0000001",
  organisationName: "Cricket Whanganui",
  isActive: true,
  isSetup: true,
  isRightsHolder: true,
  isPermissionGiven: true,
  userName: "Cricket Whanganui",
  loginEmail: "trentnixon+cw@gmail.com",
  memberSince: "14 October 2025",
  lastUpdated: "8 March 2026",
  sport: "Cricket",
  accountType: "Association",
  organisations: ["Cricket Whanganui"],
  bundleAddressedTo: "Cricket Whanganui",
  deliveryEmail: "trentnixon+cw@gmail.com",
  assetDeliveryDay: "sunday",
};
```

Scenario variants:

- `default`: old-account-data happy path.
- `setup-pending`: `isSetup=false`, still readable but shows setup warning.
- `inactive`: `isActive=false`, edit controls disabled except security.
- `saving`: same as default with disabled controls and save label.
- `loading`: wrapper loader.
- `error`: wrapper error state.

## Component Plan

Recommended file:

```txt
src/app/sandbox/route-lab/app/account/_components/account-lab-workspace.tsx
```

Convert it to a client component because it needs local draft state and dialog/toast behavior.

Recommended component breakdown:

- `AccountLabWorkspace`
- `AccountStatusStrip`
- `AccountDetailsSection`
- `SecuritySection`
- `OrganisationAccessSection`
- `BundleDeliverySection`
- `AccountFieldRow`
- `AccountToggleRow`
- `AccountSaveDialog`

Keep these local until they prove reusable.

Use existing imports:

```tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Mail, CalendarDays } from "lucide-react";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PageHeader, Surface } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  WEEKDAY_OPTIONS,
  type WeekdayKey,
  daysUntilNextDelivery,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";
```

## Layout Guidance

Use a practical account-management layout:

- Top: `PageHeader` with organisation name and page purpose.
- Next: compact status strip with 3-4 quick facts.
- Main: two-column responsive grid.
- Left column: authentication/security and organisation access.
- Right column: account overview and bundle delivery profile.
- Mobile: single column, sections stacked in the same order.

Avoid:

- Marketing hero treatment.
- Oversized cards.
- Nested cards.
- Large decorative gradients.
- Lab implementation copy inside the product-like screen.

Good local references:

- Settings surface rows: `src/app/sandbox/route-lab/app/settings/_components/settings-lab-workspace.tsx`
- Logo uploader save dialog/toast pattern: `src/app/sandbox/route-lab/app/logo-uploader/_components/logo-uploader-lab-workspace.tsx`
- Kitchen sink cards: `src/app/sandbox/kitchen-sink/cards/page.tsx`
- Page headers: `src/app/sandbox/kitchen-sink/page-headers/page.tsx`
- Production account page: `src/app/(members)/o/[accountId]/account/page.tsx`

## Editing Rules By Field

Recommended first editable draft:

```txt
isRightsHolder
isPermissionGiven
bundleAddressedTo
deliveryEmail
assetDeliveryDay
```

Recommended read-only in the first lab pass:

```txt
isSetup
isActive
userName
loginEmail
memberSince
lastUpdated
sport
accountType
organisations
password masked display
```

Reasoning:

- Rights/permission and bundle delivery are already account preference concepts.
- Login identity and password need more careful auth behavior and should be shaped separately.
- Sport, account type, and organisations are identity/context fields and should not be casually editable from this page.

## Route Lab Page Updates

Update `page.tsx`:

- Add `saving`, `setup-pending`, and `inactive` to `STATES`.
- Add `MODES = ["view", "edit"] as const`.
- Derive `workspaceMode` with the same helper style as Settings/Branding labs.
- Pass `mode`, `scenarioKey`, and `stubSaving` into `AccountLabWorkspace`.
- Update description to say fixture-only and no CMS persistence.

Suggested route scenarios:

```txt
/sandbox/route-lab/app/account
/sandbox/route-lab/app/account?mode=view
/sandbox/route-lab/app/account?mode=edit
/sandbox/route-lab/app/account?state=setup-pending
/sandbox/route-lab/app/account?state=inactive
/sandbox/route-lab/app/account?state=saving&mode=edit
/sandbox/route-lab/app/account?state=loading
/sandbox/route-lab/app/account?state=error
```

## Production Integration Later

When promoting from lab to production, likely data sources are:

- `GET /api/account/me` for user identity and account summary rows.
- `GET /api/accounts/:accountId/settings` for account settings, flags, sport, account type, setup status, and scheduler relation.
- `GET /api/accounts/:accountId/scheduler` if delivery day is not sufficiently present on settings.
- `PATCH /api/accounts/:accountId/security/profile`, `PATCH .../security/login-email`, and `POST .../security/password` for sign-in/profile writes (see `frontend-handoff-account-security-writes.md`).
- Existing settings PATCH route for delivery and preference fields if account page edits overlap with settings.

Production should not duplicate settings logic blindly. If bundle delivery edits remain on both Settings and Account, extract shared draft helpers from the settings route rather than maintaining two separate patch builders.

## Acceptance Criteria For The Lab

- The old fields are grouped into Account Overview, Sign-In and Security, Organisation Access, and Bundle Delivery Profile.
- The default route displays the old Cricket Whanganui data clearly.
- `mode=view` is read-only and polished.
- `mode=edit` enables only the intended local draft fields.
- `state=saving` disables save/reset/edit controls.
- `state=setup-pending` and `state=inactive` visibly change account health presentation.
- Save confirmation summarizes only changed fields.
- Confirming save shows a toast and does not call any API.
- The page uses existing `PageHeader`, `Surface`, `Button`, `Dialog`, `Select`, `Switch`, and typography primitives.
- No CMS/BFF/API integration is added in this pass.

## First Implementation Slice

1. Update route controls in `page.tsx`.
2. Convert `account-lab-workspace.tsx` to a client component.
3. Add the default fixture and scenario transforms.
4. Build read-only grouped sections.
5. Add edit mode for organisation access and bundle delivery fields.
6. Add save/reset state, confirmation dialog, and stub toast.
7. Run lint on the two account lab files.
8. Open the route in the browser and check desktop/mobile layout.
