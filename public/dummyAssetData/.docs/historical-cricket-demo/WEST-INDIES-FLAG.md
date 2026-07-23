# West Indies flag asset exception

## Why this is an exception

West Indies is a multi-national cricket board / team identity, not an ISO country. It therefore cannot use a standard `flag-icons` ISO SVG.

## Approved asset

| Field              | Value                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Local path         | `public/dummyAssetData/flags/wi.svg`                                                                           |
| Public URL         | `/dummyAssetData/flags/wi.svg`                                                                                 |
| Asset              | Historical **pre-1999** West Indies Cricket Board / team flag                                                  |
| Source page        | https://commons.wikimedia.org/wiki/File:WestIndiesCricketFlagPre1999.svg                                       |
| Download URL       | https://commons.wikimedia.org/wiki/Special:FilePath/WestIndiesCricketFlagPre1999.svg                           |
| Licence claim      | Public domain / PD-expired (per Wikimedia Commons file page; Commons notes post-1999 versions are copyrighted) |
| Retrieved          | 2026-07-23                                                                                                     |
| Local modification | Added `viewBox="0 0 486 309"` only (width/height already 486×309); no redesign                                 |

## Explicitly rejected

- Modern commercial **Cricket West Indies (CWI) crest**
- Post-1999 copyrighted WICB / CWI flag artwork
- ICC event artwork
- Hotlinked remote images

## Format note

SVG is retained for parity with the other local demo flags. Raster PNG conversion may be considered later if the Remotion / logo pipeline requires it; that is out of scope for this exception subitem.

## Remotion QA

Composition-level Remotion preview of WI logos waits until cricket example JSON logo URLs are rewritten to `/dummyAssetData/flags/wi.svg`. Static smoke path: `/dummyAssetData/flags/wi.svg`.
