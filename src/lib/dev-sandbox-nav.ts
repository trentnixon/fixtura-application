import { ROUTES } from "@/lib/config/routes";

/**
 * Top-level dev sandbox tools. Append entries here as new sandbox areas are added.
 */
export type SandboxPortalLink = {
  href: string;
  label: string;
  description?: string;
};

/** Primary sandbox tools — shown on `/sandbox` and in the route lab sidebar. */
export const SANDBOX_PORTAL_LINKS: SandboxPortalLink[] = [
  {
    href: ROUTES.routeLab,
    label: "Route lab",
    description: "Landing & full-page scenarios",
  },
  {
    href: ROUTES.kitchenSink,
    label: "Kitchen sink",
    description: "Components & design primitives",
  },
  {
    href: ROUTES.interactionLab,
    label: "Interaction lab",
    description: "Behaviour, state transitions & async flows",
  },
];

export type SandboxNavSection = {
  title: string;
  links: { href: string; label: string }[];
};

/**
 * Route lab screen routes — extend as new lab pages are added.
 * New pages should use RouteLabPage with an appropriate contentPreset (auth | form | full); see RouteLabScreenBody.
 */
export const ROUTE_LAB_NAV_SECTIONS: SandboxNavSection[] = [
  {
    title: "Public",
    links: [
      { href: `${ROUTES.routeLab}/public/sign-in`, label: "Sign in" },
      { href: `${ROUTES.routeLab}/public/forgot-password`, label: "Forgot password" },
    ],
  },
  {
    title: "Organisation gateway",
    links: [
      { href: `${ROUTES.routeLab}/org/select-organisation`, label: "Select organisation" },
      { href: `${ROUTES.routeLab}/org/create-organisation`, label: "Create organisation" },
    ],
  },
  {
    title: "App (scoped)",
    links: [
      { href: `${ROUTES.routeLab}/app/dashboard`, label: "Dashboard" },
      { href: `${ROUTES.routeLab}/app/settings`, label: "Settings" },
    ],
  },
];

const IL = ROUTES.interactionLab;

/** Interaction lab placeholder routes — extend when scenarios are implemented. */
export const INTERACTION_LAB_NAV_SECTIONS: SandboxNavSection[] = [
  {
    title: "Upload",
    links: [
      { href: `${IL}/upload/drag-drop`, label: "Drag and drop" },
      { href: `${IL}/upload/multi-file`, label: "Multi file" },
      { href: `${IL}/upload/image-crop`, label: "Image crop" },
    ],
  },
  {
    title: "Drag and drop",
    links: [{ href: `${IL}/drag-drop/list-reorder`, label: "List reorder" }],
  },
  {
    title: "Forms",
    links: [{ href: `${IL}/forms/async-submit`, label: "Async submit" }],
  },
  {
    title: "Selection",
    links: [{ href: `${IL}/selection/bulk-actions`, label: "Bulk actions" }],
  },
  {
    title: "Dialogs",
    links: [{ href: `${IL}/dialogs/confirm-flows`, label: "Confirm flows" }],
  },
  {
    title: "Colour",
    links: [{ href: `${IL}/color-picker`, label: "Colour picker" }],
  },
];
