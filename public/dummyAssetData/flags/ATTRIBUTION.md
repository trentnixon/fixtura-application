# Flag asset attribution

## Upstream (ISO / national flags)

- Collection: [lipis/flag-icons](https://github.com/lipis/flag-icons)
- Licence: MIT (see [`LICENSE`](./LICENSE) in this directory)
- Copyright: Panayiotis Lipiridis
- Aspect ratio: `4x3` variants from `flags/4x3/`
- Pinned commit: `086f7e97d657358203916dbe84f61c2bccaa81eb`
- Retrieved: 2026-07-23

These SVGs are vendored copies only. Do not hotlink the GitHub CDN from Remotion datasets. There is no `flag-icons` runtime npm dependency.

## Files

| File         | Nation / side        | Upstream path                 |
| ------------ | -------------------- | ----------------------------- |
| `af.svg`     | Afghanistan          | `flags/4x3/af.svg`            |
| `au.svg`     | Australia            | `flags/4x3/au.svg`            |
| `bd.svg`     | Bangladesh           | `flags/4x3/bd.svg`            |
| `gb-eng.svg` | England              | `flags/4x3/gb-eng.svg`        |
| `in.svg`     | India                | `flags/4x3/in.svg`            |
| `ie.svg`     | Ireland              | `flags/4x3/ie.svg`            |
| `nz.svg`     | New Zealand          | `flags/4x3/nz.svg`            |
| `pk.svg`     | Pakistan             | `flags/4x3/pk.svg`            |
| `za.svg`     | South Africa         | `flags/4x3/za.svg`            |
| `lk.svg`     | Sri Lanka            | `flags/4x3/lk.svg`            |
| `zw.svg`     | Zimbabwe             | `flags/4x3/zw.svg`            |
| `ke.svg`     | Kenya                | `flags/4x3/ke.svg`            |
| `nl.svg`     | Netherlands          | `flags/4x3/nl.svg`            |
| `ae.svg`     | United Arab Emirates | `flags/4x3/ae.svg`            |
| `gb-sct.svg` | Scotland             | `flags/4x3/gb-sct.svg`        |
| `na.svg`     | Namibia              | `flags/4x3/na.svg`            |
| `wi.svg`     | West Indies          | Wikimedia Commons (see below) |

Public URL pattern: `/dummyAssetData/flags/<code>.svg`

## West Indies (`wi.svg`) — resolved exception

West Indies is not an ISO country. The approved local asset is the **historical pre-1999 West Indies Cricket Board / team flag** from Wikimedia Commons.

| Field              | Value                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| Commons page       | https://commons.wikimedia.org/wiki/File:WestIndiesCricketFlagPre1999.svg             |
| Download URL       | https://commons.wikimedia.org/wiki/Special:FilePath/WestIndiesCricketFlagPre1999.svg |
| Licence claim      | Public domain / PD-expired (per Commons; post-1999 versions noted as copyrighted)    |
| Retrieved          | 2026-07-23                                                                           |
| Local path         | `wi.svg` → `/dummyAssetData/flags/wi.svg`                                            |
| Local modification | Added `viewBox="0 0 486 309"` only                                                   |
| Status             | `resolved`                                                                           |

**Rejected:** modern commercial Cricket West Indies crest; post-1999 copyrighted board artwork; ICC event artwork.

Full rationale: [`../.docs/historical-cricket-demo/WEST-INDIES-FLAG.md`](../.docs/historical-cricket-demo/WEST-INDIES-FLAG.md).

**PNG later:** SVG retained for parity with other demo flags; raster conversion may be revisited if Remotion/logo needs require it.

## QA smoke

With the Next.js app running, confirm HTTP 200 for ISO and WI flags, e.g. `/dummyAssetData/flags/au.svg` and `/dummyAssetData/flags/wi.svg`. Composition JSON logo wiring happens in later sanitisation subitems.
