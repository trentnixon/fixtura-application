# Templates Guide

This file explains:

- what templates are in this repo
- how template selection works
- how to switch to a different template
- what background options exist
- what asset/composition types are available for each sport right now

## Template system overview

Templates live in `src/templates/variants/`.

Each template variant exports a component that wraps the shared `BaseTemplate` and swaps in its own:

- theme
- intro
- main layout
- outro
- background
- animation config

The central registry is `src/templates/registry.tsx`.

Current template options in the registry are:

- `Basic`
- `Brickwork`
- `Classic`
- `CNSW`
- `CNSWPrivate`
- `Sixers`
- `Thunder`
- `TwoColumnClassic`
- `Mudgeeraba`
- `BroadcastPro`

## How template selection works

Production template selection is driven from the dataset.

The main fields are:

- `data.videoMeta.video.appearance.template`
- `data.videoMeta.video.templateVariation.useBackground`
- `data.videoMeta.video.metadata.compositionId`

These are resolved in `src/core/preview/getProductionCompositionFromData.ts`.

In production:

- `appearance.template` picks the template, for example `Basic` or `BroadcastPro`
- `templateVariation.useBackground` picks the background mode, for example `Solid` or `Image`
- `metadata.compositionId` picks the asset/composition type, for example `CricketResults`

The final Remotion composition id is built like this:

```ts
`${templateId}-${useBackground}-${compositionId}`;
```

Example:

```ts
Basic - Solid - CricketResults;
BroadcastPro - Image - CricketTop5Batting;
Brickwork - Video - AFLLadder;
```

## How to select a new template

To switch templates, change:

```ts
data.videoMeta.video.appearance.template = "BroadcastPro";
```

To switch background mode, change:

```ts
data.videoMeta.video.templateVariation.useBackground = "Solid";
```

To switch asset/composition type, change:

```ts
data.videoMeta.video.metadata.compositionId = "CricketResults";
```

### Example dataset snippet

```ts
videoMeta: {
  video: {
    appearance: {
      template: "Classic",
    },
    templateVariation: {
      useBackground: "Gradient",
    },
    metadata: {
      compositionId: "CricketUpcoming",
    },
  },
}
```

## Background options available now

All templates in the registry currently advertise the same background options:

- `Graphics`
- `Solid`
- `Image`
- `Gradient`
- `Video`
- `Particle`
- `Pattern`
- `Texture`

These are declared in `src/templates/registry.tsx`.

If no background is provided in production, the resolver falls back to:

```ts
Solid;
```

## Important note about `appearance.type`

`src/core/utils/datasetProcessing.ts` also writes:

```ts
videoMeta.video.appearance.type = variant;
```

At the moment, production resolution does not use `appearance.type` to choose the template. The important values are:

- `appearance.template`
- `templateVariation.useBackground`
- `metadata.compositionId`

So if you are changing templates manually, `appearance.template` is the one that matters most.

## Current asset/composition types by sport

These come from:

- `src/core/utils/compositionMapping.ts`
- `src/core/utils/routing.tsx`
- `testData/index.ts`

## Cricket

Cricket has the most complete implementation in this repo.

Current cricket asset/composition types:

- `CricketLadder`
- `CricketUpcoming`
- `CricketTop5Batting`
- `CricketTop5Bowling`
- `CricketBattingPerformances`
- `CricketBowlingPerformances`
- `CricketResults`
- `CricketRoster`
- `CricketResultSingle`
- `CricketTeamOfTheWeek`

### Cricket implementation status

These are fully wired in `src/compositions/cricket/index.tsx` and routed through sport-specific composition maps.

Coverage by template is not perfectly identical for every asset type, but cricket is the sport with the real template implementations.

### Cricket template coverage today

- `Ladder`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`, `broadcastpro`
- `Upcoming`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`, `broadcastpro`
- `Top5`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`, `broadcastpro`
- `Results`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`
- `ResultSingle`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`
- `Roster`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `mudgeeraba`, `broadcastpro`
- `Performances`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`, `broadcastpro`
- `TeamOfTheWeek`: `basic`, `brickwork`, `sixers`, `thunder`, `classic`, `twocolumnclassic`, `cnsw`, `cnswprivate`, `mudgeeraba`

Notes:

- `Sixers` and `Thunder` often share the same implementation.
- `TwoColumnClassic` is usually wired as `twocolumnclassic`.
- `BroadcastPro` is not present for every cricket asset type yet.

## AFL

Current AFL asset/composition types:

- `AFLLadder`
- `AFLResults`
- `AFLSingleGameResult`
- `AFLTop5`
- `AFLUpcoming`

### AFL implementation status

Routing exists for AFL in `src/core/utils/routing.tsx`.

But the current AFL composition module in `src/compositions/afl/index.tsx` is still placeholder-only, with:

- `ladder.basic`
- `top5.basic`
- `results.basic`
- `upcoming.basic`
- `singleGameResult.basic`

So today AFL is declared, but not yet built out with the full template set.

## Netball

Current Netball asset/composition types:

- `NetballLadder`
- `NetballResults`
- `NetballSingleGameResult`
- `NetballTop5`
- `NetballUpcoming`

### Netball implementation status

Routing exists for netball in `src/core/utils/routing.tsx`.

But the current netball composition module in `src/compositions/netball/index.tsx` is also placeholder-only, with:

- `ladder.basic`
- `top5.basic`
- `results.basic`
- `upcoming.basic`
- `singleGameResult.basic`

So today netball is declared, but not yet built out with the full template set.

## What is available in the dev browser right now

`src/DevelopmentRoot.tsx` builds the Remotion folder tree from:

- template registry
- template background variants
- `datasetsByCategory` from `testData/index.ts`

Right now, only the `Cricket` dataset group is enabled in `testData/index.ts`.

The `AFL` and `Netball` dataset groups are present but commented out there, so they do not currently appear in the development browser folder list.

## How to add a new template

At a high level:

1. Add a new folder under `src/templates/variants/<YourTemplate>/`
2. Export the template component from that folder's `index.tsx`
3. Import it into `src/templates/registry.tsx`
4. Add it to `templateRegistry`
5. Add sport-specific composition implementations where needed, especially under `src/compositions/cricket/`

Important:

- Adding a template to `templateRegistry` makes it selectable at the template layer
- But each sport/composition map still needs an implementation for that template, otherwise routing can fall back to a placeholder or fail to resolve

## Practical summary

If you want to switch an existing render to another template today, the main change is:

```ts
data.videoMeta.video.appearance.template =
  "Basic" |
  "Brickwork" |
  "Classic" |
  "CNSW" |
  "CNSWPrivate" |
  "Sixers" |
  "Thunder" |
  "TwoColumnClassic" |
  "Mudgeeraba" |
  "BroadcastPro";
```

If you want to switch the background treatment, change:

```ts
data.videoMeta.video.templateVariation.useBackground =
  "Graphics" | "Solid" | "Image" | "Gradient" | "Video" | "Particle" | "Pattern" | "Texture";
```

If you want the broadest real coverage today, use cricket assets. AFL and netball are mapped and named, but their current composition implementations are still basic placeholders.
