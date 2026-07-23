# Sources — Historical Cricket Demo Manifest

Retrieved: 2026-07-23

## Policy

- Historical participants, fixtures, venues and professional-player eligibility are source-backed.
- Standings, innings, bowling figures and scorecards are **not** asserted as historical facts in this manifest.
- Prefer ICC / ESPNcricinfo primary pages; Wikipedia/CricInfo archives used only with retrieval notes.

## Tournaments

| Tournament               | Primary sources                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| 1996 Cricket World Cup   | ESPNcricinfo Wills World Cup 1995/96 series; Wikipedia group tables           |
| 1999 Cricket World Cup   | CricInfo WC99 playing conditions archive; ESPNcricinfo/ESPN tables            |
| ICC KnockOut Kenya 2000  | Wikipedia 2000 ICC KnockOut Trophy; CricketArchive event match list           |
| 2007 Cricket World Cup   | Wikipedia tournament + Super Eight stage pages                                |
| 2015 Cricket World Cup   | ESPNcricinfo ICC Cricket World Cup 2014/15 series                             |
| 2017 Champions Trophy    | ESPNcricinfo series; Wikipedia Group A table                                  |
| 2019 Cricket World Cup   | ICC fixture release; ESPNcricinfo series/scorecards; ECB fixture confirmation |
| 2022 Men's T20 World Cup | ICC fixture announcement; ESPNcricinfo match schedule                         |

## Fixtures locked for datasets

- **2019 Upcoming / Results pairings and dates** come from ICC/ECB fixture releases and ESPNcricinfo scorecards (e.g. ENG vs SA 30 May 2019, Oval).
- **2022 Roster / ResultSingle pairings and dates** come from ESPNcricinfo ICC Men's T20 World Cup 2022/23 schedule (e.g. AUS vs NZ 22 Oct 2022 SCG; WI vs IRE 21 Oct 2022 Bellerive).

## Flags

- Preferred ISO/national SVG source: MIT-licensed [flag-icons](https://github.com/lipis/flag-icons).
- Target directory: `public/dummyAssetData/flags/` — **16 ISO/national SVGs present** (see [`ATTRIBUTION.md`](../../flags/ATTRIBUTION.md) and [`LICENSE`](../../flags/LICENSE)).
- Pinned upstream commit: `086f7e97d657358203916dbe84f61c2bccaa81eb` (retrieved 2026-07-23).
- West Indies (`wi.svg`) **resolved**: Commons pre-1999 board/team flag (see [`WEST-INDIES-FLAG.md`](./WEST-INDIES-FLAG.md)). Modern CWI crest rejected.

## Sync note

The Remotion vendor PowerShell/copy workflow updates `preview.mjs` / `preview.d.ts` only. It does **not** copy or regenerate `public/dummyAssetData/Cricket/*.json` or this manifest.
