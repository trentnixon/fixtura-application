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
