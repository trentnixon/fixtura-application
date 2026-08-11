# Admin Frontend: Trigger Association Single Scrape — Button Integration

**From:** CMS (Strapi) Backend Team
**To:** Admin Frontend Team
**Date:** 2026-03-15
**Purpose:** Instructions for integrating the trigger-association-single-scrape endpoint with an onClick button in the admin UI. Includes TypeScript types, request/response contracts, and implementation guidance.

---

## 1. Overview

The admin frontend can trigger a **single-association** scrape by calling `POST /api/association-overview-queues/trigger-association-single-scrape` with `{ associationId }`. The CMS looks up the association, resolves the PlayHQ URL from `association.href`, and enqueues a job to `scrape:association-single`. The bull-bridge-worker picks it up, scrapes the PlayHQ page, and POSTs the result to the `association-overview-queue` collection.

**Use case:** A "Refresh" or "Scrape Association" button on the association detail page. When clicked, the frontend sends the association ID. The CMS handles URL resolution and queueing.

---

## 2. Endpoint Contract

| Property         | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Method**       | POST                                                                               |
| **Path**         | `/api/association-overview-queues/trigger-association-single-scrape`               |
| **Full URL**     | `{CMS_BASE_URL}/api/association-overview-queues/trigger-association-single-scrape` |
| **Auth**         | None required (`auth: false`). Can be called without Bearer token.                 |
| **Content-Type** | `application/json`                                                                 |

---

## 3. Request Payload — TypeScript Types

### 3.1 Full type definition

```typescript
/**
 * Request payload for POST /api/association-overview-queues/trigger-association-single-scrape
 * CMS looks up the association by ID and resolves the URL from association.href.
 */
interface TriggerAssociationSingleScrapeRequest {
  associationId: number; // Required. Strapi association document ID.
}
```

### 3.2 Required vs optional

| Field           | Required | Type   | Notes                                                                                        |
| --------------- | -------- | ------ | -------------------------------------------------------------------------------------------- |
| `associationId` | **Yes**  | number | Strapi association document ID. Association must exist and have a valid `href` (PlayHQ URL). |

---

## 4. Response — TypeScript Types

### 4.1 Success response (HTTP 200)

```typescript
interface TriggerAssociationSingleScrapeSuccessResponse {
  success: boolean; // true
  jobId: number; // Bull queue job ID
  runId: string; // Run identifier (e.g. assoc-single-1710500000000)
  message: string; // "Single association scrape job queued successfully"
  queueName: string; // "scrape:association-single"
}
```

### 4.2 Error responses

| HTTP Status | Body               | Type                                                                                        |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------- |
| **400**     | Strapi error shape | Validation — associationId invalid, association not found, or association has no valid href |
| **500**     | Strapi error shape | Server/queue error                                                                          |

**400 examples:**

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "associationId must be a positive integer"
  }
}
```

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Association not found: 999"
  }
}
```

```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Association has no href (PlayHQ URL)"
  }
}
```

**500 example:**

```json
{
  "error": {
    "status": 500,
    "name": "InternalServerError",
    "message": "Error queueing single association scrape: ..."
  }
}
```

### 4.3 Error response type (for handling)

```typescript
interface StrapiErrorResponse {
  error?: {
    status: number;
    name: string;
    message: string;
  };
}
```

---

## 5. Example Request Bodies

### 5.1 Minimal (association detail page)

```json
{
  "associationId": 2935
}
```

### 5.2 From route/context

When on the association edit/detail page, use the association ID from the route or context:

```json
{
  "associationId": 42
}
```

---

## 6. Button Click Integration — Implementation Guide

### 6.1 High-level flow

1. User is on the association detail/edit page (has `associationId` from route or context).
2. User clicks a button (e.g. "Refresh Association" or "Scrape Association Overview").
3. On click, call `POST /api/association-overview-queues/trigger-association-single-scrape` with `{ associationId }`.
4. On success (200): show success message with jobId and queueName.
5. On error (4xx/5xx): show error message to the user.

### 6.2 Fetch example (TypeScript/React)

```typescript
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";

async function triggerAssociationSingleScrape(
  payload: TriggerAssociationSingleScrapeRequest,
): Promise<TriggerAssociationSingleScrapeSuccessResponse> {
  const res = await fetch(
    `${CMS_BASE_URL}/api/association-overview-queues/trigger-association-single-scrape`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message ?? data?.message ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data as TriggerAssociationSingleScrapeSuccessResponse;
}
```

### 6.3 React button + handler example (association detail page)

```tsx
function TriggerAssociationSingleScrapeButton({ associationId }: { associationId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await triggerAssociationSingleScrape({ associationId });
      toast.success(`Scrape job queued (Job ID: ${result.jobId}, Queue: ${result.queueName})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to trigger single association scrape");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Queuing..." : "Refresh Association"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </>
  );
}
```

### 6.4 Minimal one-click

```tsx
const handleClick = async () => {
  setLoading(true);
  try {
    const result = await triggerAssociationSingleScrape({ associationId });
    toast.success(`Job ${result.jobId} queued to ${result.queueName}`);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed");
  } finally {
    setLoading(false);
  }
};
```

---

## 7. Validation Rules (Server-Side)

| Field              | Validation                                                |
| ------------------ | --------------------------------------------------------- |
| `associationId`    | Required. Must be a positive integer.                     |
| Association        | Must exist in CMS.                                        |
| `association.href` | Must be non-empty and start with `http://` or `https://`. |

---

## 8. Summary Table

| Item              | Value                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Endpoint**      | `POST {CMS_BASE_URL}/api/association-overview-queues/trigger-association-single-scrape` |
| **Auth**          | None required                                                                           |
| **Request body**  | `TriggerAssociationSingleScrapeRequest` (JSON, `associationId` required)                |
| **Success**       | 200, `TriggerAssociationSingleScrapeSuccessResponse`                                    |
| **Client errors** | 400 (validation)                                                                        |
| **Server errors** | 500                                                                                     |

---

## 9. References

- [cms-trigger-association-single.md](../../association/.comms/cms-trigger-association-single.md) — Queue spec, Bull payload, worker handoff
- Backend handler: `src/api/association-overview-queue/controllers/handlers/TriggerAssociationSingleScrape.js`
