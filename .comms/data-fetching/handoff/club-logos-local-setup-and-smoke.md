# Club logos — local Strapi setup & API smoke (dev)

Use this before testing `/o/:accountId/club-logos` saves in the members app.

---

## 1. Strapi permissions (required)

**Settings → Users & Permissions → Authenticated → Account** — enable:

| Admin label                    | Scope                                               |
| ------------------------------ | --------------------------------------------------- |
| `getAccountClubLogosDirectory` | `api::account.account.getAccountClubLogosDirectory` |
| `uploadAccountClubLogo`        | `api::account.account.uploadAccountClubLogo`        |
| `patchAccountClubLogo`         | `api::account.account.patchAccountClubLogo`         |

Missing a permission → **403** on that route.

Restart Strapi after permission changes if your build caches policy.

---

## 2. Smoke: M1 then W2 (bypass Next BFF)

Use a JWT for a user who **owns** association `accountId (e.g. 575)` and a `clubId` in that account’s directory (e.g. from `GET …/club-logos-directory`).

Replace `STRAPI_URL`, `JWT`, `ACCOUNT_ID`, `CLUB_ID`, and path to a PNG.

```bash
# M1 — expect HTTP 201 + { "data": { "id": <mediaId> } }
curl -sS -w "\n%{http_code}\n" -X POST "${STRAPI_URL}/api/accounts/${ACCOUNT_ID}/clubs/${CLUB_ID}/logo/upload" \
  -H "Authorization: Bearer ${JWT}" \
  -F "file=@./test-logo.png"

# W2 — expect HTTP 200 + { "data": { "id", "name", "logoUrl" } }
curl -sS -w "\n%{http_code}\n" -X PATCH "${STRAPI_URL}/api/accounts/${ACCOUNT_ID}/clubs/${CLUB_ID}/logo" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d "{\"logoMediaId\": <mediaId>}"

# Clear Fixtura Logo only — expect 200 (logoUrl may remain if PlayHQ/Parent fills cascade)
curl -sS -w "\n%{http_code}\n" -X PATCH "${STRAPI_URL}/api/accounts/${ACCOUNT_ID}/clubs/${CLUB_ID}/logo" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"logoMediaId": null}'
```

- **405** on these URLs → CMS route not deployed or wrong method — not an app URL typo.
- **404** → account not owned, club out of competitive scope, or club-org write attempted.

---

## 3. Next dev server

After adding BFF files under `src/app/api/accounts/...`, restart `next dev` so App Router picks up handlers.

Canonical contract: [cms-handoff-club-logos-fe.md](./cms-handoff-club-logos-fe.md).
