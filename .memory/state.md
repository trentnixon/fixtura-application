# State

_Last updated: 2026-04-29 (episode — season overview summary UI primitives + header polish)._

## Current focus

- Keep season members pages aligned with shared app UI primitives and typography conventions.
- Continue reducing raw text primitives in season `_sections` where practical.
- Preserve consistent section styling across season overview, competition, grade, and fixture views.

## Next actions

- [ ] Apply the primitive-first text pattern to adjacent season `_sections` when those files are touched.
- [ ] Review readability/contrast for dark (`bg-primary-950`) season summary surfaces across themes.
- [ ] Validate section/divider spacing and readability across mobile and desktop breakpoints.
- [ ] Consider adding explicit `primary` shade tokens if `primary-600` style utility usage should be first-class.

## Blockers / risks

- Visual drift risk remains if old primitive patterns and new componentized patterns diverge between nearby sections.
- Theme token/shade expectations can still cause mismatched utility usage unless token maps remain explicit.
- Season detail contracts remain partly loose pending stable upstream payload shapes.
