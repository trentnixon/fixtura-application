# 03 — Onboarding funnel events

**What to build:** The create-organisation onboarding wizard emits explicit catalog events for funnel analysis — wizard entry, step progression, completion, and abandonment — all with `surface: app` and without sensitive field values in payloads.

**Blocked by:** 02 — Identity lifecycle

**Status:** ready-for-agent

- [ ] Wizard start event fires when user enters create-organisation flow.
- [ ] Step completion events fire for each wizard step per marketing event catalog (names and properties aligned).
- [ ] Wizard finish / confirm success event fires when onboarding completes.
- [ ] Abandon or step-back events are captured where catalog defines them (or documented App additions proposed to catalog).
- [ ] Events include `accountId` when account context exists; no email, passwords, or form field values in properties.
- [ ] Event catalog updated (or comms doc added) for any App-only onboarding events introduced.
