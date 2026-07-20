# LLM Implementation Prompt — Media Gallery categories

Implement Monday parent `2791582021`: Media Gallery — Organisation-aware category assignments.

## Authority order

1. Parent delivery guide and approved category contract
2. CMS and Application handoffs in this folder
3. Existing account-scoped Media Library contract and code
4. Repository conventions and tests

## Required order

P01 contract → CMS P02–P05 (external) → App P06 → P07–P08 → P09 verification.

## Locked rules

- No new catalogue endpoint
- No trusted browser labels
- All is scope, not a magic target
- Association assignments support multiple CMS IDs
- Historical assignments retained; settings changes never lossy-convert
- Metadata-only edits remain possible; send assignment only when changed
- Preserve account isolation and structured errors
- Renderer and scheduler outside scope

## Verification

Test all four configuration combinations, All/selected scope, historical targets, legacy rows, settings changes, and unrelated metadata edits.
