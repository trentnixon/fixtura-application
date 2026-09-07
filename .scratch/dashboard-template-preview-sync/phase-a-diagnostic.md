# Phase A diagnostic — dashboard ↔ template builder preview parity

Completed: 2026-09-07. This phase captures tooling and fixture-based findings. Live account capture requires `FIXTURA_BEARER_TOKEN` (see runner below).

## Conclusion

**Proceed to Phase B with a hybrid approach (client resolver + CMS completeness).**

Fixture diagnostics confirm the dashboard mismatch pattern when saved branding is **thin** (relation metadata without expanded render fields):

| Scenario                                            | Branding complete | Assembly parity                              | Recommendation      |
| --------------------------------------------------- | ----------------- | -------------------------------------------- | ------------------- |
| Animated — thin (`templateAnimationId` only)        | No                | Mismatch (`animation` missing on saved path) | **client-resolver** |
| Animated — CMS-complete (`animation.type` + config) | Yes               | Match                                        | **already-aligned** |
| Texture — thin (opacity/blend, no media url)        | No                | Mismatch (`texture.url` missing)             | **client-resolver** |

When CMS returns scheduler-expanded `template_option` (as documented in `templateOptionDestruct`), saved and builder-equivalent draft assemblies **already match**. When branding stores IDs or partial rows only, the builder preview works via catalog expansion but the dashboard saved path does not.

## Tooling added

### Library

`src/features/remotion-asset-preview/utils/diagnose-account-remotion-preview-parity.ts`

- `auditSavedBrandingCompleteness(branding)` — field gaps per active `useBackground`
- `buildRemotionPreviewDraftFromCurrentSelection(catalog)` — builder-equivalent draft from aggregate `currentSelection`
- `diagnoseAccountRemotionPreviewParity(input)` — compares assembled `templateVariation` for saved vs draft paths

### Runner

```bash
# Fixture-based (no auth)
npx tsx scripts/run-phase-a-remotion-preview-diagnostic.ts \
  --branding .scratch/dashboard-template-preview-sync/fixtures/animated-thin-branding.json \
  --catalog .scratch/dashboard-template-preview-sync/fixtures/animated-catalog.json

# Live Strapi account
FIXTURA_BEARER_TOKEN=... npx tsx scripts/run-phase-a-remotion-preview-diagnostic.ts --account-id <id>
```

Reports are written to `.scratch/dashboard-template-preview-sync/phase-a-diagnostic-latest.md` unless `--out` is set.

### Fixtures

`.scratch/dashboard-template-preview-sync/fixtures/`

- `animated-thin-branding.json` / `animated-complete-branding.json` / `animated-catalog.json`
- `texture-thin-branding.json` / `texture-catalog.json`

### Per-scenario reports

- `phase-a-diagnostic-animated-thin.md`
- `phase-a-diagnostic-animated-complete.md`
- `phase-a-diagnostic-texture-thin.md`

## Findings for Phase B

1. **Animated** — Saved path needs `template_option.animation.type` (and preset defaults). If absent, lazy-fetch aggregate catalog and resolve preset by `templateAnimationId` / `presetId`.
2. **Texture** — Saved path needs resolved `texture.texture.url` (via `resolvePreviewMediaUrl`). Thin rows with opacity/blend only are insufficient.
3. **Theme staleness** — `theme.theme.useBackground` often remains legacy (`Solid`) while `template_option.useBackground` is current. Saved readers correctly prefer `template_option`; resolver should dual-stamp theme when expanding (per locked spec).
4. **CMS-complete path works** — No dashboard renderer fork required when branding matches scheduler shape.

## Live account capture (still required)

Run the script against one production/local account per writeable background mode once a bearer token is available:

```bash
FIXTURA_BEARER_TOKEN=<jwt> STRAPI_URL=http://127.0.0.1:1337 \
  npx tsx scripts/run-phase-a-remotion-preview-diagnostic.ts --account-id <accountId>
```

Compare output `recommendation`:

- `already-aligned` → CMS returns expanded branding; dashboard bug may be elsewhere (cache, photo, composition)
- `client-resolver` → implement Phase B lazy resolver
- `cms-only` → assembly matches but audit flags gaps masked by catalog in builder only (unlikely)

## Tests

`diagnose-account-remotion-preview-parity.test.ts` — 8 cases covering audit, draft build, parity match/mismatch.
