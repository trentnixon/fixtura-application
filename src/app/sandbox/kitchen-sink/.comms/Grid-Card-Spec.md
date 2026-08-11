# Grid Card Spec

## Overview

This document defines a new **grid card pattern** for the Fixtura Members Area sandbox.

This card will first be designed and reviewed in:

`/sandbox/kitchen-sink/cards`

The initial goal is to create **3 visual variations** of the same core card concept so the strongest direction can be selected before building a reusable production component.

Once a direction is chosen, this should be turned into a **reusable, stylable, customisable component** for wider use across the application.

---

## Primary Purpose

This is a **1x1 square grid card** used inside grid-based layouts.

It is intended to support multiple use cases including:

- user organisation/account listing
- a `+` create/add new organisation card
- sandbox quick-link cards

This means the card must be flexible enough to work in both:

- content-style listing contexts
- action-style shortcut contexts

---

## Core Card Content

Each card should support the following content structure:

1. **Logo / image / icon area**
2. **Title**
3. **Short description**
4. **CTA or action label**

This content model should be consistent across all variations.

---

## Core Requirements

### 1. Fixed 1x1 shape

The card must always render as a true square.

It should feel deliberate and stable in a grid layout.

This is not a flexible-height card.

### 2. Works in a grid

The card is designed specifically for grid presentation.

It must work well when repeated across multiple columns and rows.

### 3. Strong information hierarchy

The title should be the main text anchor.

The description should remain short and secondary.

The CTA should feel clear, lightweight, and intentional.

### 4. Supports multiple visual identities

The card should be able to display:

- a brand/logo image
- a product icon
- a symbolic plus/add treatment
- a simple illustrative mark

### 5. Reusable foundation

The sandbox versions are for exploration only.

The final chosen direction should clearly support later extraction into a reusable component with props and variants.

---

## Use Cases

### A. Account / Organisation Card

Purpose:

- represent a user organisation or account
- show identity clearly
- allow entry into that account context

Expected content:

- logo or branded mark
- organisation name
- short supporting description
- CTA such as `Open`, `View organisation`, or `Continue`

### B. Add / Create New Organisation Card

Purpose:

- provide a strong call to create or add a new organisation
- feel related to the account cards but still distinct as an action card

Expected content:

- plus icon or add symbol
- title like `Create organisation` or `Add organisation`
- short explanatory description
- CTA such as `Create new` or `Start setup`

### C. Sandbox Quick Link Card

Purpose:

- act as a shortcut tile to a sandbox area or internal dev section
- support fast access from the sandbox hub

Expected content:

- icon or small visual mark
- title
- short summary of destination
- CTA such as `Open sandbox`, `View patterns`, or `Go to route`

---

## Layout Intent

The card should feel:

- clean
- structured
- calm
- composed
- modern
- lightly interactive

It should **not** feel:

- noisy
- crowded
- gimmicky
- overly decorative
- like a dashboard stat tile

This card is about **entry, identity, and direction**.

---

## Visual Tone

The visual language should align with the broader Members Area direction:

- professional
- calm
- minimal
- structured
- slightly premium
- utility-first, not flashy

Use subtle styling cues rather than loud effects.

---

## Card Anatomy

Recommended internal structure:

```txt
[ Top area ]
logo / icon / image

[ Middle area ]
title
description

[ Bottom area ]
cta / action label
```

The card should have a stable internal rhythm and should not feel vertically cramped.

Spacing should be generous enough that the square format feels balanced.

---

## Grid Container Requirement

A matching grid container should also be explored alongside the cards.

The grid container should:

- support multiple square cards cleanly
- have consistent gap spacing
- adapt across desktop and smaller viewports
- feel intentionally framed, not just dropped onto the page

A subtle background treatment may also be added behind the grid area.

Possible treatments:

- faint grid lines
- soft texture
- subtle panel contrast
- restrained patterning

This background must remain understated and should support the cards rather than compete with them.

---

## Card Variation Goals

The first task is to create **3 card design variations** in the kitchen sink.

These should all use the same content model but differ in visual treatment and emphasis.

The goal is to compare directions before selecting one for reuse.

---

## Variation 1 — Clean Structured Card

### Intent

This version should be the most neutral and system-friendly.

It should emphasise structure, spacing, and clarity over decoration.

### Characteristics

- soft border or subtle outline
- restrained background
- simple icon/logo area
- strong typographic hierarchy
- light hover treatment
- very clean CTA treatment

### Best for

- organisation listing
- general reusable system card
- safe default direction

### Keywords

- clean
- modular
- quiet
- dependable
- system-first

---

## Variation 2 — Soft Panel / Elevated Card

### Intent

This version should feel slightly more premium and tactile.

It should still be calm, but with a bit more surface presence.

### Characteristics

- slightly stronger panel background
- subtle depth or soft shadow
- more prominent top visual area
- slightly richer hover state
- polished and composed feel

### Best for

- account/organisation selection
- feature entry points
- more premium UI moments

### Keywords

- polished
- elevated
- composed
- premium-light
- tactile

---

## Variation 3 — Action / Add New Card

### Intent

This version should emphasise action more clearly while still belonging to the same family.

It should work especially well for `Create organisation` or `Add new` states.

### Characteristics

- stronger icon treatment
- slightly more obvious CTA framing
- clearer action-led hierarchy
- still square and calm, but more directional
- should feel related to the other cards, not like a separate design system

### Best for

- add/create new organisation
- quick action shortcuts
- sandbox jump-off cards

### Keywords

- action-led
- inviting
- clear
- lightweight
- purposeful

---

## Shared Constraints Across All Variations

All 3 versions must:

- remain square
- use the same content architecture
- sit cleanly in the same grid
- feel like members-area UI, not marketing UI
- support icon/logo/image usage
- support action-focused variants
- remain suitable for later reuse as one component family

---

## Content Constraints

### Title

- should be short
- ideally 1 line, with 2 lines maximum
- must remain visually strong

### Description

- should be concise
- ideally 1–2 short lines
- should not dominate the card

### CTA

- should be lightweight and clear
- can be a text link, inline action, or low-emphasis button treatment
- should not overpower the title

### Logo / Icon / Image

- should be visually anchored
- should feel intentional inside the square format
- should not consume too much vertical space

---

## Interaction Expectations

The card should support lightweight interactivity.

Recommended interactions:

- hover elevation or border emphasis
- subtle background shift
- soft icon motion or accent response
- clear clickable affordance

Interaction should remain restrained and professional.

Avoid exaggerated animation.

---

## Responsive Expectations

The card should:

- remain square at all sizes
- scale cleanly in smaller grids
- preserve spacing and hierarchy at narrower widths
- remain readable when repeated in a multi-column layout

---

## Accessibility Expectations

The card should support:

- clear focus state
- sufficient text contrast
- meaningful CTA language
- keyboard accessibility when clickable
- accessible treatment for icon-only add/create states

If the whole card is clickable, focus and hover states must clearly communicate that.

---

## Kitchen Sink Task

Inside `/sandbox/kitchen-sink/cards`, create:

1. a **grid section** for this card family
2. a **grid container treatment** behind or around the cards
3. **3 card variations** using the same content types
4. example data for:
   - organisation card
   - create/add card
   - sandbox quick link card

The output should make it easy to visually compare the 3 directions side by side.

---

## Example Content Set

### Organisation Card

- Title: `Northern District Cricket Club`
- Description: `Manage branding, sponsors, content, and organisation settings.`
- CTA: `Open organisation`
- Visual: logo image or placeholder crest

### Add Organisation Card

- Title: `Create organisation`
- Description: `Add a new club, association, or internal workspace to the members area.`
- CTA: `Start setup`
- Visual: plus icon

### Sandbox Quick Link Card

- Title: `Route Lab`
- Description: `Open the page sandbox for route layouts, states, and flow testing.`
- CTA: `Open sandbox`
- Visual: route/icon symbol

---

## Component Extraction Goal

After review, the selected design direction should be turned into a reusable component.

The final reusable component should support configurable props such as:

- `title`
- `description`
- `ctaLabel`
- `icon`
- `image`
- `logo`
- `href`
- `variant`
- `tone`
- `isAddCard`

This reusable component must be styleable enough to support:

- organisation entry cards
- add/create cards
- quick link cards

without fragmenting into multiple unrelated components.

---

## Design Goal Summary

The goal is to create a **square grid card family** that feels calm, modern, and reusable.

It should support identity, action, and navigation in the same visual system.

The kitchen sink should first explore 3 variations of this concept. Once one is selected, that version should be refined into a reusable Members Area component for use across organisation selection, add/create flows, and sandbox quick links.

---

## Output Instruction for the LLM

Build a new card exploration section in `/sandbox/kitchen-sink/cards` for a square 1x1 grid card family.

Requirements:

- include a grid container treatment
- include 3 visual card variations
- each card must support title, description, CTA, and logo/image/icon
- include examples for organisation card, add/create card, and sandbox quick link card
- keep the UI calm, professional, and reusable
- design with future component extraction in mind

Do not build the final reusable component yet.

This step is for visual exploration and comparison first.
