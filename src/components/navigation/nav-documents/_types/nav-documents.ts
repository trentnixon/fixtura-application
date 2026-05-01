import type { Icon } from "@tabler/icons-react";

export type NavDocumentItem = {
  name: string;
  url: string;
  icon: Icon;
};

export type NavDocumentsProps = {
  items: NavDocumentItem[];
};
