# Logo Uploader Route Lab Handoff

## Purpose

Create a new Route Lab screen for an organisation logo uploader:

```txt
/sandbox/route-lab/app/logo-uploader
```

This is a pre-production lab for the future production feature that lets users upload, crop, edit, replace, and preview the single logo attached to their organisation/account.

There is only one logo per organisation, so this feature should expose one uploader only.

The lab should help validate the complete user experience before wiring production persistence:

- Upload one organisation logo.
- Crop or recrop the image.
- Replace or clear the pending image.
- Preview the logo inside Fixtura asset examples.
- Show how the uploaded logo behaves with the selected brand colour palette.
- Show how the uploaded logo behaves with the selected template mode/contrast preset.
- Stub save behaviour in Route Lab unless explicitly testing the real API.

No production code should be assumed complete just because the onboarding upload endpoint exists. See the API notes below.

## Current Findings

### Existing Route Lab Pattern

The Route Lab already has scoped app examples:

- `src/app/sandbox/route-lab/app/dashboard/page.tsx`
- `src/app/sandbox/route-lab/app/branding/page.tsx`
- `src/app/sandbox/route-lab/app/settings/page.tsx`

The Branding lab is the best route example for this work:

```txt
src/app/sandbox/route-lab/app/branding/page.tsx
```

It uses:

- `RouteLabPage`
- fixture-backed data
- `state` and `mode` query parameters
- a production route reference
- a wrapped production-like workspace component

New Route Lab pages should also be registered in:

```txt
src/lib/dev-sandbox-nav.ts
```

Add the new entry under the `App (scoped)` section, beside Dashboard, Branding, and Settings.

### Recommended Lab Route

Use:

```txt
/sandbox/route-lab/app/logo-uploader
```

Suggested production route reference for the Route Lab header:

```txt
/o/:accountId/branding
```

or, if the team decides this deserves its own production sub-route:

```txt
/o/:accountId/branding/logo
```

Recommendation: keep the production feature inside the existing Branding area unless product wants logo management to become a separate settings-style screen.

## Uploader Component To Use

Use the existing crop uploader:

```txt
src/components/media/image-uploader-crop.tsx
```

Component:

```tsx
ImageUploaderCrop;
```

This is the right component because it already supports:

- single image upload
- drag/drop
- file browse
- PNG/JPEG/WebP accept defaults
- file size validation
- source image validation
- output crop validation
- crop dialog
- selectable crop ratios
- recrop
- clear
- replace image
- cropped `File` output
- local `previewUrl`
- useful crop metadata

Use the shared logo crop presets:

```txt
src/lib/media/selectable-logo-crop-presets.ts
```

Export:

```tsx
SELECTABLE_LOGO_CROP_PRESETS;
```

Current presets:

- `1:1 - Square`
- `4:5 - Portrait`
- `5:4 - Landscape`
- `9:16 - Story`
- `16:9 - Wide`

For this feature, default to square and hide the ratio picker on the uploader surface so ratio selection happens inside the crop dialog:

```tsx
<ImageUploaderCrop
  aspect={1}
  aspectPresets={[...SELECTABLE_LOGO_CROP_PRESETS]}
  defaultAspectPresetIndex={0}
  hideAspectPresetOnUploader
  label=""
  helperText="PNG, JPEG, or WebP up to 8MB. Choose a file to crop; you can change the aspect ratio in the dialog."
  maxFileSizeMb={8}
  onComplete={handleLogoCropComplete}
  onReset={handleLogoUploaderReset}
/>
```

Existing examples:

```txt
src/app/sandbox/interaction-lab/upload/image-crop/page.tsx
src/app/(members)/create-organisation/_components/wizard-step-branding.tsx
```

## Preview Component

Use the existing Fixtura preview component:

```txt
src/components/brand-color/fixtura-asset-color-preview.tsx
```

Component:

```tsx
FixturaAssetColorPreview;
```

It accepts:

```tsx
primaryHex: string;
secondaryHex: string;
logoSrc?: string | null;
templateModeSlug?: string | null;
```

This is already used by the Branding workspace:

```txt
src/features/branding/components/branding-workspace/index.tsx
```

For the logo uploader lab, feed it:

- selected primary colour
- selected secondary colour
- uploaded/cropped logo `previewUrl`, falling back to fixture `onboardingLogo.url`
- selected template mode slug

The preview should update immediately after crop completion.

## Branding/Palette/Mode Integration

The current Branding feature already has most of the required UI logic:

```txt
src/features/branding/components/branding-workspace
```

Important pieces:

- `BrandColorField` for custom primary/secondary colours.
- `FixturaAssetColorPreview` for visual preview.
- `BrandingTemplateModeCardsInput` for template mode selection.
- `useTemplateModePickerList` for selected template mode state.
- onboarding theme lookup for premade palettes.

For the first Logo Uploader lab, keep the scope focused:

1. Let the user upload/crop a logo.
2. Let the user change primary and secondary colours.
3. Let the user select template mode.
4. Render preview examples using the selected values.
5. Stub save behaviour.

Do not duplicate the entire Branding screen unless product wants this route to become a full branding replacement. The purpose here is to prove the logo uploader and preview behaviour.

## API And Storage Notes

The storage upload endpoint already exists, but it is currently onboarding-specific.

Existing upload BFF:

```txt
POST /api/accounts/:accountId/onboarding/step-2/upload
```

File:

```txt
src/app/api/accounts/[accountId]/onboarding/step-2/upload/route.ts
```

Client service:

```txt
accountApi.uploadOnboardingStep2Logo(accountId, file)
```

Defined in:

```txt
src/lib/api/services/account.api.ts
```

The upload returns:

```ts
{
  data: {
    id: number;
  }
}
```

The returned media id is linked to the account through onboarding Step 2:

```txt
PATCH /api/accounts/:accountId/onboarding/step-2
```

Body field:

```ts
logoMediaId?: number | null;
```

Existing hook:

```txt
src/lib/api/hooks/account/useUpdateOnboardingStep2.ts
```

That hook uploads the file first, merges `logoMediaId`, then patches Step 2.

### Important API Caveat

The existing production Branding endpoint does not currently accept logo updates.

Existing Branding BFF:

```txt
GET/PATCH /api/accounts/:accountId/branding
```

File:

```txt
src/app/api/accounts/[accountId]/branding/route.ts
```

Current PATCH intent:

- save palette
- save template mode

Current PATCH type:

```txt
PatchAccountBrandingBody
```

Defined in:

```txt
src/types/api/account.ts
```

It does not currently include `logoMediaId`.

### Recommended Production API Decision

Before shipping the production feature, choose one of these paths:

#### Option A: Reuse onboarding endpoints after onboarding

Use:

```txt
POST /api/accounts/:accountId/onboarding/step-2/upload
PATCH /api/accounts/:accountId/onboarding/step-2
```

Pros:

- Least backend change if already supported outside onboarding.
- Existing frontend hook exists.

Cons:

- Naming is misleading after onboarding.
- Production Branding/Settings code becomes coupled to onboarding semantics.
- Future maintainers may not expect a live branding feature to write through an onboarding route.

#### Option B: Add proper account branding logo persistence

Recommended.

Possible contracts:

```txt
POST /api/accounts/:accountId/branding/logo
PATCH /api/accounts/:accountId/branding/logo
```

or extend:

```txt
PATCH /api/accounts/:accountId/branding
```

with:

```ts
logoMediaId?: number | null;
```

Pros:

- Correct production domain.
- Keeps onboarding and ongoing account maintenance separate.
- Easier to document and reason about.

Cons:

- Requires backend/CMS contract update.
- Requires new BFF/service/hook or a Branding PATCH type extension.

Recommendation: use Option B for production. The lab can still simulate the flow and optionally include a dev-only smoke test for the existing onboarding upload path.

## Suggested Files To Add

Suggested minimal lab structure:

```txt
src/app/sandbox/route-lab/app/logo-uploader/page.tsx
src/app/sandbox/route-lab/app/logo-uploader/_components/logo-uploader-lab-workspace.tsx
```

Optional fixture file:

```txt
src/features/route-lab/fixtures/logo-uploader.ts
```

The existing Branding fixture may be enough for the first pass:

```txt
src/features/route-lab/fixtures/branding.ts
```

It already includes:

```ts
onboardingLogo;
```

## Suggested Lab States

Support these Route Lab `state` values:

```txt
default
empty
uploaded
loading
error
saving
```

Suggested behaviour:

- `default`: fixture logo exists.
- `empty`: no logo on account yet.
- `uploaded`: pre-seed the preview with a lab image or show a completed local state.
- `loading`: branded loader.
- `error`: error state.
- `saving`: save button disabled/pending visual.

Support these `mode` values:

```txt
view
edit
```

Suggested behaviour:

- `view`: show current logo and previews, no uploader controls.
- `edit`: show uploader, palette controls, mode controls, and save stub.

## Suggested Workspace Behaviour

Client component state:

```ts
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
const [primary, setPrimary] = useState(initialPrimary);
const [secondary, setSecondary] = useState(initialSecondary);
```

On crop complete:

```ts
function handleLogoCropComplete(payload: ImageUploaderCropCompletePayload) {
  setLogoFile(payload.file);
  setLogoPreviewUrl(payload.previewUrl);
}
```

Preview logo source:

```ts
const effectiveLogoSrc = logoPreviewUrl ?? data.onboardingLogo?.url ?? null;
```

Render:

```tsx
<FixturaAssetColorPreview
  primaryHex={primary}
  secondaryHex={secondary}
  logoSrc={effectiveLogoSrc}
  templateModeSlug={selectedMode?.slug ?? null}
/>
```

Save behaviour in lab:

- Do not call CMS by default.
- Show confirmation dialog or direct toast.
- Display pending/confirmed state.
- Include summary of what would be sent:
  - cropped file name
  - MIME
  - size
  - dimensions
  - selected crop ratio
  - selected primary/secondary
  - selected template mode

## UX Notes

The screen should be practical and production-like, not a marketing page.

Suggested layout:

- Header from `RouteLabPage`.
- Main content split:
  - left: current logo/uploader and controls
  - right: sticky preview panel
- One uploader only.
- Clear distinction between current saved logo and pending cropped logo.
- Avoid nested cards.
- Keep controls compact and consistent with Branding.
- Use existing typography, cards, buttons, field feedback, and preview components.

Useful copy:

- "Upload and crop your organisation logo."
- "This replaces the logo used in generated assets and account previews."
- "PNG, JPEG, or WebP up to 8MB."
- "Choose a file to crop; you can change the aspect ratio in the dialog."

Do not add explanatory tutorial text inside the actual production-like UI beyond normal helper text.

## Validation Notes

For the first lab pass:

- `maxFileSizeMb`: `8`
- accepted types: existing defaults from `ImageUploaderCrop`
- default aspect: `1`
- selectable presets: `SELECTABLE_LOGO_CROP_PRESETS`

Potential future production validation:

- Require minimum source dimensions, e.g. `500x500`.
- Require minimum output dimensions, e.g. `400x400`.
- Consider keeping PNG output for logos to preserve transparency where possible.

The current uploader defaults to PNG output:

```ts
outputFormat = "image/png";
```

This is appropriate for organisation logos.

## Acceptance Criteria For Lab

- Route exists at `/sandbox/route-lab/app/logo-uploader`.
- Route is registered in the Route Lab sidebar.
- Page uses `RouteLabPage`.
- Page supports relevant `state` and `mode` query params.
- Edit mode shows exactly one logo uploader.
- Uploader uses `ImageUploaderCrop`.
- Uploader uses `SELECTABLE_LOGO_CROP_PRESETS`.
- Cropped upload updates local preview immediately.
- Existing fixture logo is shown when no new logo has been cropped.
- Preview uses `FixturaAssetColorPreview`.
- Preview reflects selected primary colour.
- Preview reflects selected secondary colour.
- Preview reflects selected template mode slug.
- Save action is stubbed in Route Lab and does not call CMS by default.
- Lab clearly shows current/pending logo state.
- No production API assumptions are hidden; the route should document or expose that persistence is stubbed.

## Production Follow-Up Checklist

- Decide production route placement:
  - inside `/o/[accountId]/branding`, or
  - separate `/o/[accountId]/branding/logo`.
- Decide CMS/BFF contract for updating logo outside onboarding.
- Prefer adding production-domain branding logo persistence rather than calling onboarding Step 2 forever.
- Add/extend frontend service in `account.api.ts`.
- Add/extend query hook for logo update.
- Invalidate:
  - `queryKeys.account.branding(accountId)`
  - `queryKeys.account.me`
  - `queryKeys.account.settings(accountId)`
  - maybe `queryKeys.account.mediaLibrary(accountId)` if logo upload appears in media library
- Update `AccountBrandingData` or related type if the CMS returns changed logo shape.
- Add tests for hook/service parsing if a new route is added.
- Verify dashboard/sidebar/org switcher logo behaviour after update.

## Relevant Code References

Route Lab:

```txt
src/app/sandbox/route-lab/app/branding/page.tsx
src/lib/dev-sandbox-nav.ts
src/components/dev/RouteLabPage.tsx
```

Uploader:

```txt
src/components/media/image-uploader-crop.tsx
src/components/media/image-crop-dialog.tsx
src/lib/media/selectable-logo-crop-presets.ts
src/app/sandbox/interaction-lab/upload/image-crop/page.tsx
```

Onboarding logo flow:

```txt
src/app/(members)/create-organisation/_components/wizard-step-branding.tsx
src/lib/api/hooks/account/useUpdateOnboardingStep2.ts
src/app/api/accounts/[accountId]/onboarding/step-2/upload/route.ts
src/lib/api/services/account.api.ts
```

Branding preview:

```txt
src/features/branding/components/branding-workspace/index.tsx
src/features/branding/components/branding-workspace/_hooks/use-branding-workspace.ts
src/components/brand-color/fixtura-asset-color-preview.tsx
src/features/route-lab/fixtures/branding.ts
```

Branding API:

```txt
src/app/api/accounts/[accountId]/branding/route.ts
src/types/api/account.ts
src/lib/api/hooks/account/usePatchAccountBranding.ts
```
