# 07 — Activation configuration saves

**What to build:** Track when users save delivery settings, notifications, branding, logo, and template builder — the configuration steps that gate meaningful bundle delivery.

**Blocked by:** 02 — Identity lifecycle (shipped)

**Status:** ready-for-agent

**Related:** `phase-2-plan.md` (activation milestone Q2)

## Events

| Event                                  | Properties                                 | Trigger                           |
| -------------------------------------- | ------------------------------------------ | --------------------------------- |
| `user_action` `settings_saved`         | `accountId`, `fields_changed[]`            | Settings preferences save success |
| `user_action` `notifications_saved`    | `accountId`, `fields_changed[]`            | Notifications form patch success  |
| `user_action` `branding_saved`         | `accountId`, `fields_changed[]`            | Branding workspace patch success  |
| `user_action` `brand_logo_updated`     | `accountId`, `action`: `upload` \| `clear` | Logo upload or clear success      |
| `user_action` `template_builder_saved` | `accountId`                                | Template builder put success      |

## Tasks

### Phase 1: Settings & notifications

- [ ] `use-account-settings-preferences-state.ts` — on `mutateAsync` resolve, emit `settings_saved` with keys from `partialPatch` (e.g. `includeJuniorSurnames`, `deliveryWeekday`, `competitionsGroupedBy`)
- [ ] `notifications-form.tsx` — after successful contact/delivery-day patch, emit `notifications_saved` with changed field keys only

### Phase 2: Branding & logo

- [ ] `use-branding-workspace.ts` — on `patchBranding.mutateAsync` success, emit `branding_saved` with body object keys
- [ ] `brand-logo-workspace/index.tsx` — emit `brand_logo_updated` with `action: 'upload'` or `'clear'`

### Phase 3: Template builder

- [ ] `template-builder-content.tsx` — on `putTemplateOptions.mutateAsync` success, emit `template_builder_saved`

### Phase 4: Catalog & tests

- [ ] Update `.comms/handoff/analytics-app-events.md`
- [ ] Add capture mock assertions to existing settings save test if present

## Constraints

- `fields_changed` = property key names only, never values (especially no emails)
- Account-scoped routes already have `group("organization")` — include `accountId` on events for query convenience
- Read-only / support view: do not emit save events when save is blocked

## Completion criteria

- Each save path fires exactly once per successful server write
- PostHog MCP shows `settings_saved` with `fields_changed` array after local smoke save
