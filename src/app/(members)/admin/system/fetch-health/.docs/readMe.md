# Admin Fetch Health Service

## Overview

The Fetch Health system is a live diagnostic tool for the Fixtura Members Area. It provides real-time visibility into the implementation status and connectivity of the application's API routes.

## How it Works

The system follows the standard **API Data Layer** architecture:

1.  **Registry (`route-definitions.ts`)**: The single source of truth for all routes. Every route in this file has an `implementationStatus` (Ready/Planned).
2.  **API Route (`/api/admin/fetch-health`)**: Server-side logic that scans the Registry and returns a structured health report.
3.  **Service (`health.api.ts`)**: A typed client-side service for fetching the status.
4.  **Hook (`useFetchHealth.ts`)**: A TanStack Query hook that manages the data fetching and caching for the UI.
5.  **Page (`/admin/system/fetch-health`)**: The admin panel that displays the results.

## How to Add New Routes

To make a new route visible in the health check:

1.  Open `src/lib/api/routes/route-definitions.ts`.
2.  Add your route to the appropriate domain (e.g., `bundles`, `templates`).
3.  Set the `status` to `"planned"` initially, and move it to `"ready"` once the endpoint is live.

## How to Edit the Diagnostic Logic

If you need to change how "health" is calculated (e.g., adding actual ping tests):

1.  Modify `src/app/api/admin/fetch-health/route.ts`.
2.  Ensure any new data returned matches the `FetchHealthResponse` interface in `src/lib/api/services/health.api.ts`.

## Development vs. Production

- **In Development**: This page is used to track work-in-progress endpoints.
- **In Production**: This page serves as a connectivity monitor to ensure internal API routes are accessible.
