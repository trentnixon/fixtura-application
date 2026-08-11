# Handoff documents (application / frontend LLM)

This folder stores **phase completion handoffs** for consumers of the new account admin APIs — especially an **LLM working on the Fixtura admin application**.

## Naming

Use one file per phase completion:

`handoff-phase-NN-<short-slug>.md`

Examples:

- `handoff-phase-00-contract.md`
- `handoff-phase-07-renders-list.md`

Do not overwrite old handoffs; if you redo a phase, add a suffix such as `-v2` or a date: `handoff-phase-07-renders-list-2026-04-05.md`.

## When to add a file

At **every** phase completion, after updating [PHASE-CHECKLIST.md](../PHASE-CHECKLIST.md).

## Template

Copy [TEMPLATE-handoff.md](./TEMPLATE-handoff.md) and fill all sections.

## Audience

Write so a **frontend** developer or **app LLM** can:

- call the right URL with the right auth and account ID rules
- understand response shape and error behaviour
- migrate off the organisation hub without reading backend implementation files
