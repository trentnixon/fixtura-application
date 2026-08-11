# Synthetic statistics policy

## Hard separation

| Kind              | Allowed in manifest           | Examples                                                                                                  |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `historical`      | Yes                           | Nation names, tournament stages, real fixtures/dates/venues, professional players who appeared in the era |
| `synthetic-rules` | Yes (generator metadata only) | Seed, labelling strings, ladder/batting/bowling/scorecard constraints, candidate example figures          |

## Required labels for later JSON rewrites

- `Demo Recreation — Fictional Statistics`
- `Demo Recreation — Fictional Standings`

## Deterministic generation inputs

- `syntheticGeneration.seed`: `fixtura-cricket-demo-v1`
- `syntheticGeneration.version`: `1.0.0`

Later generators must derive fictional numbers from these inputs (or a documented successor seed) so rewrites are reviewable and repeatable.

## Candidate examples

Brief-supplied Top5 batting/bowling example figures and the “India 315/7 …” results narrative live under `syntheticGeneration.candidateExamples` with `isSynthetic: true`. They are **not** historical facts and must not be copied into historical nodes.

## What this subitem does not do

- Does not invent ladder positions or scorecards into historical sections.
- Does not rewrite the ten active Remotion example JSON files.
- Does not add flag SVG binaries (tracked in subsequent flag subitems).
