# 08 — Session replay (sampled + masked)

**What to build:** Enable session replay on members app at 20–30% sample with input masking and block/mask selectors for billing and profile UI. Product approval required before shipping.

**Blocked by:** Product sign-off on replay for logged-in app.

**Status:** ready-for-agent

**Owner:** Members app (this repo)

### Tasks

- [ ] Add replay config constants (sample_rate ~0.2–0.3, maskAllInputs, blockSelector, maskTextSelector, network payload off).
- [ ] Flip `disable_session_recording` when enabled; keep behind env or explicit product flag if needed.
- [ ] Add `data-ph-block` / `data-ph-mask` to billing tables and sensitive profile/org name regions.
- [ ] Update init options unit tests for replay block.
- [ ] Manual QA: recording on onboarding/billing route; inputs masked; blocked regions not visible in PostHog replay player.

### Acceptance

- Replay recordings appear at expected sample rate (~4–6/day at current traffic).
- No unmasked billing table or password fields in sample recordings reviewed.
