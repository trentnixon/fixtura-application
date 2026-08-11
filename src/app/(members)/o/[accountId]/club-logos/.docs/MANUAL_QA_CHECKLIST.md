# Manual QA — Club logos (association)

Run after [`.comms/data-fetching/handoff/club-logos-local-setup-and-smoke.md`](../../../../../../../.comms/data-fetching/handoff/club-logos-local-setup-and-smoke.md) (Strapi permissions + optional curl smoke).

Substitute **575** / **30753** with valid association account id and a club id from directory.

## A. Directory read

- [ ] Navigate to `/o/575/club-logos`
- [ ] Network: `GET /api/accounts/575/club-logos-directory` → **200**
- [ ] Rows sorted; `logoUrl` absolute URL or absent/`null`

## B. Save (M1 + W2)

- [ ] `/o/575/club-logos/30753`
- [ ] Crop + **Save logo**
- [ ] Order: `POST …/clubs/30753/logo/upload` → **201** `{ data: { id } }`
- [ ] Then: `PATCH …/clubs/30753/logo` → **200** `{ data: { id, name, logoUrl } }`
- [ ] List thumbnail updates; reopen editor shows new logo as editable source

## C. Clear uploaded Fixtura logo

- [ ] **Remove uploaded logo** → confirm
- [ ] `PATCH …/logo` with `{ logoMediaId: null }` → **200**
- [ ] If PlayHQ/parent cascade applies, thumbnail may **still** show URL (expected)

## D. Errors

- [ ] Bogus `/club-logos/999999999` → handled (not found / empty row)
- [ ] Wrong permissions → **403**

## Automated sanity

- `npx tsc --noEmit` passes at repo root
