# Fixtura Members Application

Domain language for the Fixtura members (account-scoped) application.

## Language

### Remotion preview

**Account Remotion Preview**:
The pure assembly of an account’s branding and sponsors into a Remotion dataset for in-app preview. Saved branding and unsaved template-builder choices are two sources into the same assembly.
_Avoid_: preview pipeline, merge branding, remotion hook (those name implementation pieces)

**Remotion Preview Draft**:
The unsaved template-builder choices needed for Account Remotion Preview, expressed as a feature DTO — not the full editor state.
_Avoid_: TemplateBuilderEditorState, draft branding, preview branding blob

### Sponsors

**Sponsor Position Slot**:
A named placement on the club sponsor layout (primary and general slots) used by manage-sponsors allocation and by Remotion sponsor payload assembly.
_Avoid_: sponsor position, slot def (when meaning the shared vocabulary)

### Analytics

**Analytics Surface**:
Where a captured event originated: `marketing_site`, `app`, or `hub`. Every PostHog event includes a `surface` property.
_Avoid_: domain name as surface (e.g. application.fixtura.com.au)

**Analytics Consent**:
User opt-in before client analytics capture. Canonical key `fixtura_analytics_consent`; granted value `granted`. Stored in a `.fixtura.com.au` cookie for cross-subdomain sharing; application falls back to per-origin localStorage during migration.
_Avoid_: assuming localStorage is shared across subdomains

**Ingest Proxy**:
Same-origin `/ingest` route proxied to PostHog US. Configured in `next.config.ts`; not driven by environment variables.
_Avoid_: `NEXT_PUBLIC_POSTHOG_HOST`, third-party ingest URL in client init
