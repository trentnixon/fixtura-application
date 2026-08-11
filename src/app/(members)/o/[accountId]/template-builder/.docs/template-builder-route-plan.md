# Template Builder UI Design Brief

## Purpose Of This Document

This document is intended to guide an LLM designer.

The goal is to turn the existing POC builder into a full-screen, visual template-builder interface.

The design needs to support:

- loading the account's saved template setup
- creating a local draft selection
- previewing the draft before save
- showing what changed from the saved state
- saving valid changes
- switching preview asset types/compositions so different template options can be tested

Use this document as the product/UI direction for the screen.

## Product Intent

The template builder should feel like a full-screen design workspace, not a diagnostic page or a settings form.

A user should be able to answer three questions quickly:

- What template setup is currently saved?
- What am I changing right now?
- What will those changes look like before I save?

The screen should prioritize visual choice, confident editing, and fast preview testing over exposing technical details.

The designer should avoid a plain form made of select controls. The builder should present option groups as browsable visual choices: cards, thumbnails, swatches, tabs, segmented controls, and guided steps where useful.

## Target User Flow

1. The page loads the account's saved template setup and opens with a live preview.
2. User can change the asset type/composition being previewed so they can test the template against different generated asset layouts.
3. User moves through visual option groups: category, mode, palette, background type, and the active background asset.
4. User selects options from rich visual cards or thumbnail grids, not generic dropdown selects.
5. Preview updates from the local draft before save.
6. The UI marks changed groups and enables save.
7. User can reset to saved state or save changes.
8. After save, the UI should reflect the latest saved state.

## UI Design Direction

Design this as a full-screen builder.

Preferred layout:

- Immersive full-screen workspace.
- Large live preview region.
- Persistent navigation or step rail for option groups.
- Option browser panel for thumbnails, cards, and visual controls.
- Persistent save/reset/status actions.
- Stacked layout on smaller screens.
- Preview should remain visually dominant because the user's main task is choosing a template look.
- Controls should feel like a design tool, not an admin form. Avoid a marketing-page feel.

Design priorities:

- Make the saved-vs-draft relationship obvious without making every row feel noisy.
- Make asset preview testing a first-class control.
- Let the user browse settings visually.
- Keep save/reset actions visible and easy to understand.
- Use visual grouping or guided steps for "Asset test", "Template", "Style", and "Background".
- Use simple labels that describe the user's choice.
- Prefer cards, thumbnails, swatches, segmented controls, tabs, and galleries over selects.

Avoid:

- Raw technical descriptions as prominent product copy.
- Large hero sections.
- Decorative cards around every region.
- Nested cards.
- Overly illustrative UI that competes with the preview.
- Showing every option group at once when only one background asset picker is relevant.
- Generic select-only forms.
- A narrow right-hand settings card as the entire experience.

## Suggested Screen Structure

### Page Header

Keep the header short and product-facing.

Recommended:

- Title: `Template builder`
- Subtitle: short purpose copy, for example `Choose the visual system used for generated assets.`

Avoid showing long technical explanations in the subtitle.

### Preview And Asset Test Area

The preview is the user's visual feedback loop.

It should:

- show the active draft, not only the saved state
- update when editor controls change
- allow the user to change the asset type/composition being previewed
- expose thumbnail/frame options when available so different generated asset formats can be tested
- make it clear when no preview data is available
- occupy a major full-screen region
- remain first or near-first on mobile unless the product decision is to prioritize editing first

The preview currently may include composition/asset selection when available. In the redesigned UI, this becomes a required product control:

- user should be able to switch the previewed asset type/composition
- user should be able to review thumbnail frames/options for the selected asset
- active asset type should be clear in the UI
- template option changes should be tested against the selected asset type immediately

### Editor Area

The editor should become a visual option browser, not a basic select form.

Recommended sections:

- Asset test
- Template
- Style
- Background
- Review/save

Possible interaction models:

- Wizard/stepper: one focused group at a time with preview always visible.
- Design-tool layout: left rail for groups, center preview, right/bottom option browser.
- Tabbed visual browser: tabs for Template, Style, Background, Review.
- Hybrid: full-screen preview with a bottom drawer of visual options.

The designer can choose the model, but the chosen UI must make all groups easy to discover without turning the page into a long form.

Status/actions should remain visible or easy to reach:

- changed state in plain language
- reset to saved
- save changes
- saving state
- success state
- validation/error state

Template basics should include:

- Category
- Mode
- Palette

Background should include:

- Use background
- exactly one background asset picker when relevant
- empty/help state for `Solid` or unset background
- thumbnails/previews for asset-backed options where the data supports it

Pattern should remain hidden for now.

## Field Behavior Direction

Use controls that match the job:

- Category: visual choice card/list.
- Mode: visual choice card/list.
- Palette: color swatches or palette cards.
- Use background: segmented control, icon tabs, or visual cards.
- Background asset: thumbnail/card gallery shown only for the active background type.

Do not use generic select dropdowns as the primary UI for these groups. The intended UX is visual selection.

The background type controls which background picker is visible:

| Use background value | Visible picker                                |
| -------------------- | --------------------------------------------- |
| `Solid`              | none                                          |
| `Gradient`           | Gradient                                      |
| `Video`              | Video                                         |
| `Image`              | Image                                         |
| `Graphics`           | Noise                                         |
| `Texture`            | Texture                                       |
| `Particle`           | Particle                                      |
| unset/null           | none, show prompt to choose a background type |

When the background type changes:

- show only the relevant background picker
- keep the preview focused on the active background choice
- avoid showing stale choices from a previous background type

Each field should communicate:

- saved value
- current draft value
- whether the field changed

But the UI does not need to repeat all three pieces with equal weight in every row. A good design can show saved value as supporting text, changed state as a subtle chip, and draft value as the selected control value.

## Visual Option Browser Direction

Each option group should be displayed in a way that helps the user understand the visual outcome before clicking.

Recommended treatments:

| Option group   | Preferred UI treatment                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Category       | cards with name, saved/current marker, and short metadata such as fixture division or audio bundle when useful |
| Mode           | cards or segmented tiles using name/slug and a short visual preview if available                               |
| Palette        | color swatches/palette strips using `value` when it is a color or token; fallback to labeled cards             |
| Gradient       | preview strips/cards using `type` and `direction`; fallback to labeled gradient cards                          |
| Image          | cards describing animation type, direction, overlay style, gradient type, and opacity                          |
| Noise/Graphics | cards showing noise type; include generated thumbnail pattern if no source image exists                        |
| Particle       | cards showing particle type, count, speed, direction, and animation                                            |
| Texture        | thumbnail cards using available texture media, with opacity/blend mode metadata                                |
| Video          | video option cards with name, position, size, loop/muted/rate/volume/overlay metadata                          |
| Pattern        | hidden for now unless explicitly added later                                                                   |

Thumbnail/video requirements:

- Texture options should use available media as the thumbnail when present.
- Video options should be represented as video-style cards. Show the settings that affect playback/layout: position, size, loop, muted, rate, volume, offthread, overlay.
- Image/noise/particle/gradient options should use generated visual placeholders/previews if no media exists.
- Every visual card must still work when an option has missing media or missing metadata.
- Cards should show selected, saved, changed, disabled/loading, and unavailable states.
- Visual cards should be keyboard accessible.

The final result should feel closer to choosing a design theme from a creative tool than filling in fields.

## Asset Type Testing Direction

The builder must include a clear way to change the previewed asset type/composition.

This control should:

- be visible near the preview
- show the currently previewed asset type/composition
- let the user switch between available asset examples/compositions
- show thumbnail frames or preview stills where available
- update the preview without changing saved template options
- be treated as preview context, not as part of the saved template choices

The purpose is to let users test whether the selected template options work across different generated asset outputs.

## Copy Direction

Use human-facing labels:

- `Category`
- `Mode`
- `Palette`
- `Use background`
- `Background asset`, `Gradient`, `Image`, `Video`, etc. depending on the visible picker

Recommended action copy:

- `Reset to saved`
- `Save changes`
- `No changes`
- `Saving...`
- `Template options saved.`

Recommended empty/help copy:

- `Choose a background type to pick a background asset.`
- `Solid backgrounds do not need an asset.`

## Option Groups

- Category
- Mode
- Palette
- Use background
- Gradient
- Image
- Graphics/noise
- Particle
- Texture
- Video

Always show Category, Mode, Palette, and Use background. Show only the relevant background asset picker after the user chooses a background type.

## UI Requirements

- Use visual controls, not plain dropdown selects, for the main experience.
- One field per primary option group.
- Only one background asset field should be visible at a time.
- Show the saved/current value.
- Show the selected draft value.
- Show whether each field is changed or unchanged.
- Disable save when there are no changes.
- Show loading, saving, success, and error states.
- Preserve reset-to-saved behavior.
- Keep controls usable on mobile.
- Provide a way to switch preview asset type/composition.
- Provide thumbnail/card layouts for image, texture, video, gradient, noise, particle, and palette options where possible.
