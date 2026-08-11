# Skill — System Diagnostics & Health Monitoring

## 1. Purpose

This skill defines how to maintain and expand the application's internal diagnostic tools, specifically the **Fetch Health** system.

It ensures:

- **Registry Monitoring**: All application routes are represented in the diagnostic dashboard.
- **Uniform Reporting**: Every endpoint reports its implementation status (Ready/Planned).
- **Service Observability**: Admins have a clear view of the API's responsiveness and overall health.

---

## 2. When to Use This Skill

Use this skill when:

- Adding new routes to the **Route Registry** (`route-definitions.ts`).
- Modifying the **Health API** logic in `src/app/api/admin/fetch-health/route.ts`.
- Updating the **Admin Diagnostic UI** in `src/app/(members)/admin/system/fetch-health/page.tsx`.
- Auditing the application's readiness for production.

---

## 3. Maintenance Pattern

### Updating the Registry

When a new feature requires a new endpoint:

1.  **Define**: Add the path and metadata to `src/lib/api/routes/route-definitions.ts`.
2.  **Tag**: Mark the `status` as `"planned"`.
3.  **Confirm**: Refresh the **Fetch Health** dashboard to see the new route listed.

### Promoting to "Ready"

Only change a route's status to `"ready"` when:

- The backend/Next.js route handler is fully implemented.
- The corresponding `apiService` function is tested and functional.
- The route successfully responds to a health check via the diagnostic dashboard.

---

## 4. Diagnostic Page UI Rules

The diagnostic dashboard must include:

1.  **Summary Cards**: Overall system status and total route counts.
2.  **Filterable Table**: List of routes grouped by domain (e.g., Auth, Account).
3.  **Visual Indicators**: Use consistent badges (Green for `Ready`, Gray for `Planned`).
4.  **Manual Refresh**: Always provide a manual trigger to re-run the diagnostic check.

---

## 5. What Not to Do

- **Do not bypass the registry**: Never hardcode a route in the UI or a service without first defining it in `route-definitions.ts`.
- **Do not hide failures**: If an endpoint is broken, the diagnostic dashboard should reflect it as an error or "Missing".

---

## 6. Verification Checklist

- [ ] New route appears in the **Fetch Health** dashboard.
- [ ] Status badge correctly reflects the development state (Planned/Ready).
- [ ] The dashboard successfully fetches data using the `useFetchHealth` hook.
- [ ] No unauthorized user can access the diagnostic page (enforced via middleware-protected `/admin/*` under `src/app/(members)/admin/*`).
