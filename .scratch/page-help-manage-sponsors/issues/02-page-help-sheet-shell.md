# 02 — Reusable page-help Sheet shell

**What to build:** Shared trigger + Sheet that renders `PageHelpContent`.

**Blocked by:** 01

**Status:** completed

**Canonical pattern:** `docs/agents/route-page-help.md`

## Completion summary

`src/components/page-help/` ships `PageHelpSheet` (title + summary, On this page, optional visual, Related). Feature triggers pass content in; chrome is reusable across routes.
