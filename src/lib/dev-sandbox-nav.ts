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
  {
    href: ROUTES.dataLab,
    label: "Data lab",
    description: "CMS-backed selects, lists & form patterns",
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
      { href: `${ROUTES.routeLab}/season/575/overview`, label: "Season" },
      { href: `${ROUTES.routeLab}/app/dashboard`, label: "Dashboard" },
      { href: `${ROUTES.routeLab}/app/branding`, label: "Branding" },
      { href: `${ROUTES.routeLab}/app/logo-uploader`, label: "Logo uploader" },
      { href: `${ROUTES.routeLab}/app/settings`, label: "Settings" },
      { href: `${ROUTES.routeLab}/app/notifications`, label: "Notifications" },
      { href: `${ROUTES.routeLab}/app/account`, label: "Account" },
    ],
  },
];

/** Data lab child routes — add sections here as each scenario gets a dedicated URL under `/sandbox/data-lab`. */
export const DATA_LAB_NAV_SECTIONS: SandboxNavSection[] = [
  {
    title: "Season",
    links: [
      {
        href: `${ROUTES.dataLab}/season/575/overview`,
        label: "Overview (account 575)",
      },
      {
        href: `${ROUTES.dataLab}/season/575/competitions/18031`,
        label: "Competition detail (canonical)",
      },
      {
        href: `${ROUTES.dataLab}/season/575/competitions/18031/grades/71337`,
        label: "Grade detail (canonical)",
      },
      {
        href: `${ROUTES.dataLab}/season/575/competitions/18031/grades/71337/fixtures/3571729`,
        label: "Fixture detail (canonical)",
      },
      {
        href: `${ROUTES.dataLab}/season/575/grades/71337`,
        label: "Grade detail (alias)",
      },
      {
        href: `${ROUTES.dataLab}/season/575/grades/71337/fixtures/3571729`,
        label: "Fixture detail (alias)",
      },
    ],
  },
  {
    title: "Assets",
    links: [
      {
        href: `${ROUTES.dataLab}/assets/list-for-selection`,
        label: "List for selection",
      },
    ],
  },
  {
    title: "Template options",
    links: [
      {
        href: `${ROUTES.dataLab}/template-categories/list-for-selection`,
        label: "Asset Types",
      },
      {
        href: `${ROUTES.dataLab}/template-gradients/ui`,
        label: "Gradients",
      },
      {
        href: `${ROUTES.dataLab}/template-images/ui`,
        label: "Images",
      },
      {
        href: `${ROUTES.dataLab}/template-modes/ui`,
        label: "Modes",
      },
      {
        href: `${ROUTES.dataLab}/template-noises/ui`,
        label: "Noise",
      },
      {
        href: `${ROUTES.dataLab}/template-palettes/ui`,
        label: "Palettes",
      },
      {
        href: `${ROUTES.dataLab}/template-particles/ui`,
        label: "Particles",
      },
      {
        href: `${ROUTES.dataLab}/template-patterns/ui`,
        label: "Patterns",
      },
      {
        href: `${ROUTES.dataLab}/template-textures/ui`,
        label: "Textures",
      },
      {
        href: `${ROUTES.dataLab}/template-videos/ui`,
        label: "Videos",
      },
    ],
  },
];

const IL = ROUTES.interactionLab;

/** Interaction lab placeholder routes — extend when scenarios are implemented. */
export const INTERACTION_LAB_NAV_SECTIONS: SandboxNavSection[] = [
  {
    title: "Upload",
    links: [
      /*   { href: `${IL}/upload/drag-drop`, label: "Drag and drop" },
      { href: `${IL}/upload/multi-file`, label: "Multi file" }, */
      { href: `${IL}/upload/image-crop`, label: "Image crop" },
    ],
  },
  {
    title: "Drag and drop",
    links: [{ href: `${IL}/drag-drop/list-reorder`, label: "List reorder" }],
  },
  /*  {
    title: "Forms",
    links: [{ href: `${IL}/forms/async-submit`, label: "Async submit" }],
  }, */
  /* {
    title: "Selection",
    links: [{ href: `${IL}/selection/bulk-actions`, label: "Bulk actions" }],
  }, */
  {
    title: "Dialogs",
    links: [{ href: `${IL}/dialogs/confirm-flows`, label: "Confirm flows" }],
  },
  {
    title: "Colour",
    links: [{ href: `${IL}/color-picker`, label: "Colour picker" }],
  },
  {
    title: "Calendar",
    links: [
      { href: `${IL}/calendar`, label: "Date Selection" },
      { href: `${IL}/calendar/display`, label: "Schedule display" },
    ],
  },
  {
    title: "Carousel",
    links: [{ href: `${IL}/carousel`, label: "Shadcn carousel" }],
  },
  {
    title: "Remotion",
    links: [{ href: ROUTES.remotionPreview, label: "Preview" }],
  },
];
