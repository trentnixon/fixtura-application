# Backend repo sync pointer — Support Vision + billing CMS handoff

**Purpose:** Avoid drift and broken links between Backend `docs/handoff/` and member app canonical docs.

---

## Canonical source (member app repo)

| Doc          | Member app path                                                                |
| ------------ | ------------------------------------------------------------------------------ |
| Request      | `.comms/API/handoff/cms-request-support-vision-billing-access.md`              |
| Questions    | `.comms/API/handoff/cms-questions-support-vision-billing-access.md`            |
| This pointer | `.comms/API/handoff/cms-request-support-vision-billing-access-BACKEND-SYNC.md` |

**Edit canonical only.** Merge Backend-local changes back to member app before treating them as truth.

---

## Sync checklist (Backend `docs/handoff/`)

Copy these three files from member app into Backend `docs/handoff/` **with the same filenames**:

1. `cms-request-support-vision-billing-access.md`
2. `cms-questions-support-vision-billing-access.md`
3. `cms-request-support-vision-billing-access-BACKEND-SYNC.md` (this file)

After sync, relative links between request ↔ questions ↔ BACKEND-SYNC work in the Backend repo.

**Stale copy warning:** An older Backend-only request may predate 2026-09-04 (code reality table, Track 2 auth note, orders BFF/CMS split). Replace entirely from canonical.

---

## Header for Backend copy of the request doc

When the request file lives in `docs/handoff/`, the top of that file should read (member app canonical uses the table below without “Backend sync” as the primary row):

```markdown
**Document ownership**

| Copy                         | Path                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Canonical (edit here)**    | Member app `.comms/API/handoff/cms-request-support-vision-billing-access.md` |
| **Backend sync (this file)** | CMS repo `docs/handoff/cms-request-support-vision-billing-access.md`         |
```

Do not change the canonical member-app header to say “this file” is Backend — that caused confusion in review.

---

## If companion files are not synced yet

CMS reading only the request from Backend will hit dead links for:

- `./cms-questions-support-vision-billing-access.md`
- `./cms-request-support-vision-billing-access-BACKEND-SYNC.md`

**Workaround:** Link tickets to member-app Git paths until sync is done.

---

## After CMS replies

Add to member app `.comms/API/handoff/`:

- `cms-reply-support-vision-billing-access-YYYY-MM-DD.md`

Same pattern as [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md). Sync reply into Backend `docs/handoff/` if CMS works from that repo.

---

## Implementation gate reminder

| Track                    | CMS can start                | Blocked on                                              |
| ------------------------ | ---------------------------- | ------------------------------------------------------- |
| **1** Season-hub GETs    | Yes                          | `resolveSeasonHubScope.js` + `assertAccountReadAccess`  |
| **3** Billing 5.1 / 5.1b | Yes (5.1b)                   | `listAccountBillingInvoiceRequests.js`                  |
| **2** Scrape POSTs       | **No** until Q11–12 answered | Auth model + account↔entity scoping — see questions doc |
