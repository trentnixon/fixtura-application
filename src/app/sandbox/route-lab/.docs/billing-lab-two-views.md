# Billing lab — two views implementation

This note describes how the route-lab billing UI exposes **two product views** for UI testing, without calling CMS or Stripe.

## URLs

- Main lab: `/sandbox/route-lab/o/[accountId]/billing`
- Query **`mode`**: which high-level view to render (see below).
- Query **`state`**: developer fixture scenario (unchanged from the billing LABS PDR); when `state` is omitted or `default`, the effective fixture depends on `mode`.

## Mode switch (`mode`)

Defined in `src/features/route-lab/billing/lab-billing-types.ts` as `BILLING_LAB_MODES`:

| URL value     | Meaning                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| _(no `mode`)_ | Same as first mode — **wizard** (see `src/components/dev/ScenarioSwitch.tsx`: first `mode` option clears the query param). |
| `wizard`      | **No subscription** — subscribe wizard.                                                                                    |
| `active`      | **Has subscription** — subscribed account snapshot.                                                                        |

Normalization: `normalizeBillingLabMode` in `src/features/route-lab/billing/billing-lab-mock-client.ts` maps any value other than `active` to `wizard`.

## Default fixture when `state=default`

`resolveBillingLabFixtureScenario` in `src/features/route-lab/billing/billing-lab-mock-client.ts`:

- **`wizard` + default** → fixture `not_started` (organisation needs a plan).
- **`active` + default** → fixture `active_season` (paid pass, access active).

If `state` is set to a non-default scenario (e.g. `payment_pending`), that fixture is used in **both** modes so edge cases stay testable.

## UI layout by mode

Implemented in `src/app/sandbox/route-lab/o/[accountId]/billing/_components/billing-lab-workspace.tsx`.

### `wizard` — create a subscription

- Stepper: **Choose plan** → **Pass start date** → **Checkout or invoice**.
- Journey/path tracker badges (mock) remain visible.
- **Plans** grid, date picker with **lab-estimated** end date, then simulated card / invoice actions (same mock client as before).
- **Status / trial / order** panels appear **below** the wizard for parity with the PDR’s summary contract.

### `active` — subscribed snapshot

- **Hero** card: current plan name, price, category, pass start/end, days remaining, payment status (from mock summary).
- **Status grid** (billing, access, trial, orders, invoice request JSON) matches the fixture.
- **Lab simulations** block is **collapsed by default**; expanding shows plan grid, dates, and payment mocks for renewal/edge-case testing without cluttering the primary “subscribed” story.

## Server page wiring

`src/app/sandbox/route-lab/o/[accountId]/billing/page.tsx` uses `RouteLabPage` with:

- `stateOptions` = `BILLING_LAB_SCENARIO_OPTIONS`
- `modeOptions` = `BILLING_LAB_MODES`

It passes `labMode`, resolved `scenarioKey`, and raw `devStateParam` into the workspace for labels.

## Navigation

Route lab sidebar lists **Billing (lab)** only (`/sandbox/route-lab/o/575/billing`). The **members production** billing link was removed so the lab stays self-contained.

## Related

- Product/requirements: `src/app/sandbox/route-lab/.docs/fixtura-billing-labs-pdr.md`
