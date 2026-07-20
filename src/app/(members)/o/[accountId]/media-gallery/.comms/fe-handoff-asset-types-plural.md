# FE handoff: Media Gallery `assetTypes` plural assignments

**Authoritative source:** `Backend/.comms/Monday.com/Media Gallery — Multi-asset-type image assignments/06-FE-IMPLEMENTATION-HANDOFF.md`

CMS is done. Application must migrate from singular `assetType` to canonical `assetTypes: string[]`.

Quick summary:

- **Read:** use `item.assetTypes`; ignore `assetType` except as deprecated alias
- **POST:** `formData.append("assetTypes", JSON.stringify([...]))`
- **PATCH:** `{ "assetTypes": ["...", "..."] }`
- **UI:** multi-select with exclusive `ALL`
- **Grouping:** `item.assetTypes.includes(groupName)`
- **Catalogue filter:** include `Sport: null` globals; no sport → globals only

See the Backend handoff for file-by-file changes, code targets, and verification checklist.
