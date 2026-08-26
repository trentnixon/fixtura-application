export type PageHelpItem = {
  label: string;
  howTo: string;
};

export type PageHelpVisual = {
  alt: string;
  src: string;
};

export type PageHelpAction = {
  label: string;
  href: string;
};

export type PageHelpContent = {
  title: string;
  /** One short framing blurb (benefit + asset impact), 1–2 sentences. */
  summary: string;
  /** Controls / options on this page, each with how-to use it. */
  items: PageHelpItem[];
  /** Optional; screenshots deferred — omit until assets exist. */
  visual?: PageHelpVisual;
  related: PageHelpAction[];
};
