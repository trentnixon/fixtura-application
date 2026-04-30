# State

_Last updated: 2026-04-30 (LOG — production Brand Logo: dedicated workspace + M1/W2 on `/o/[accountId]/brand-logo`)._

## Current focus

- Stabilize `/o/[accountId]/dashboard` as a UI-first page using phase hooks and a derived view model.
- Keep members dashboard and season surfaces aligned with shared UI primitives and typography conventions.
- Preserve safe diagnostics: collapsed developer payloads with token redaction.
- Members **branding** (`/o/[accountId]/branding`): responsive layout shipped; colocated splits for `BrandingScreen` and `BrandingTemplateModeCardsInput`; `page.tsx` is shell-only. Follow-up: real save in route-lab when APIs graduate. Repo-wide `tsc --noEmit` still red from unrelated sandbox files — not blocking branding edits.
- Members **Brand Logo** (`/o/[accountId]/brand-logo`): **dedicated** `BrandLogoWorkspace` + `BrandLogoScreen`; persistence via **M1 + W2** (`useUpdateOnboardingStep2`), not `PATCH /branding`. See `.comms/responses/brand-logo-cms-fed-briefing.md` for CMS confirmations.
- Sandbox **logo uploader** route lab (`/sandbox/route-lab/app/logo-uploader`): lab workspace unchanged; production link targets `brand-logo`.

## Next actions

- [ ] Validate dashboard behavior across club and association accounts with real data.
- [ ] Confirm final visibility rule for debug payloads (`development` only vs allowing `?debug=1`).
- [ ] Continue primitive-first text/component cleanup in adjacent season `_sections` as files are touched.
- [ ] Review dashboard table and summary readability at key breakpoints.
- [ ] Wire real branding save APIs in `/sandbox/route-lab/app/branding` when graduating from fixture-backed lab stubs.
- [ ] Staging QA: brand-logo save/recrop/remove; confirm CMS allows M1/W2 after onboarding (briefing §1.1).

## Blockers / risks

- Payload shape drift across phase/legacy endpoints may require ongoing view-model guard updates.
- Debug visibility policy is not finalized and could create environment-specific behavior differences.
- Brand logo save path assumes Strapi allows post-onboarding Step 2 upload/PATCH; if not, need extended `PATCH /branding` or new route (see briefing).
