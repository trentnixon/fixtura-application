# Fixtura Members Area — LLM Agent Context

You are working inside the **Fixtura Members Area** codebase.

This area is a **protected members application on a subdomain**, built with:

- Next.js App Router
- Strapi JWT authentication
- HTTP-only auth cookies
- middleware-based route protection
- a centralised API client
- development-only debug tooling

## Primary reference

Follow the rules, architecture, and constraints defined in:

`/docs/MEMBERS-AREA-AGENT.md`

Treat that document as the **source of truth** for how this system works and how it must be modified.

## Core rules

### 1. Middleware is the source of truth for access

- `/app/*` is protected
- `/login` redirects when authenticated
- do not implement page-level auth as the primary protection model

### 2. Do not bypass the auth system

- do not store JWT in localStorage or sessionStorage
- do not expose auth cookies to client code
- do not invent new auth flows without instruction

### 3. Use the central API layer

- use `apiFetch` / `apiFetchJson` for authenticated requests
- do not use raw `fetch` for protected app data unless explicitly instructed

### 4. Respect session and redirect rules

- `401` means invalid/expired session
- `401` should follow the existing logout + redirect pattern
- `403` means authenticated but not allowed
- always validate redirect paths using the safe return-path helpers

### 5. Keep middleware small

Middleware should only:

- inspect auth state
- classify route intent
- redirect appropriately

Do not place business logic in middleware.

### 6. Keep debug tooling development-only

Debug panels, middleware logs, and client-side debug helpers must never affect production behaviour or expose sensitive data.

## Modification rules

When making changes:

- preserve the existing architecture
- prefer extending current utilities over adding parallel systems
- do not duplicate logout, session, or redirect logic
- do not move auth responsibility into UI components
- keep public/auth/app shell boundaries clear

## Expected behaviour

When asked to add or modify members-area functionality:

1. check the existing architecture first
2. follow `/docs/MEMBERS-AREA-AGENT.md`
3. use established utilities and patterns
4. avoid introducing alternate flows unless explicitly requested

## If a request conflicts with the architecture

Do not silently improvise.

Call out the conflict clearly and propose the safest change that stays aligned with the existing system.
