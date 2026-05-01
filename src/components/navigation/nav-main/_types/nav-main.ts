import type { Icon } from "@tabler/icons-react";

export type NavMainItem = {
  title: string;
  url: string;
  icon?: Icon;
};

export type NavMainSection = {
  label?: string;
  items: NavMainItem[];
};
