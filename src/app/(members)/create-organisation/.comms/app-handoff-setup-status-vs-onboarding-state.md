# App handoff: setup-status (S1) vs onboarding-state

**Date:** 2026-04-09  
**See also:** `.comms/CODEX/onboarding-data-fetch-outstanding-issues-frontend.md`

## Contract

| Concern                                                                                             | Source                                                                 |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Machine-readable preparation / polling, `isUpdating`, pipeline enums on the setup-status payload    | **GET …/onboarding/setup-status** — `useOnboardingSetupStatus`         |
| Wizard completion, routing (`resolveAccountEntry`), pipeline timestamps, scoped-shell banner inputs | **GET …/onboarding/onboarding-state** — `useOnboardingOnboardingState` |

During an incomplete wizard, treat **`isUpdating` on setup-status** as the strongest signal that background onboarding work has started; do not infer “no work” from `phase: "wizard"` alone.
