export type SortItem = {
  id: string;
  label: string;
  order: number;
};

export type SortGroup = {
  id: string;
  title: string;
  items: SortItem[];
};

export type TeamSortItem = {
  id: string;
  label: string;
  subtitle?: string;
  order: number;
  isLocked?: boolean;
};

export const ALPHABET_SORT_ITEMS_MOCK: SortItem[] = [
  { id: "f1", label: "First Grade", order: 1 },
  { id: "f2", label: "Second Grade", order: 2 },
  { id: "f3", label: "Third Grade", order: 3 },
  { id: "f4", label: "Fourth Grade", order: 4 },
  { id: "f5", label: "Fifth Grade", order: 5 },
];

export const GROUPED_SORT_ITEMS_MOCK: SortGroup[] = [
  {
    id: "g1",
    title: "Senior Competitions",
    items: [
      { id: "s1", label: "First Grade", order: 1 },
      { id: "s2", label: "Second Grade", order: 2 },
      { id: "s3", label: "Third Grade", order: 3 },
    ],
  },
  {
    id: "g2",
    title: "Junior Competitions",
    items: [
      { id: "j1", label: "Under 17s", order: 1 },
      { id: "j2", label: "Under 15s", order: 2 },
      { id: "j3", label: "Under 13s", order: 3 },
    ],
  },
  {
    id: "g3",
    title: "Women’s Competitions",
    items: [
      { id: "w1", label: "First XI", order: 1 },
      { id: "w2", label: "Development Squad", order: 2 },
    ],
  },
];

export const TEAM_SORT_GROUPS_MOCK: {
  id: string;
  title: string;
  items: TeamSortItem[];
}[] = [
  {
    id: "t-g1",
    title: "First Grade",
    items: [
      { id: "t1", label: "Hawkesbury Hawks", subtitle: "2019 Premier", order: 1 },
      { id: "t2", label: "Blue Mountains United", subtitle: "2020 Premier", order: 2 },
      { id: "t3", label: "Western Rangers", subtitle: "Defending Premier", order: 3 },
    ],
  },
  {
    id: "t-g2",
    title: "Second Grade",
    items: [
      { id: "t4", label: "Eastside Lions", subtitle: "Promoted 2023", order: 1 },
      { id: "t5", label: "Riverdale CC", subtitle: "Runners-up", order: 2 },
      { id: "t6", label: "Central District", subtitle: "Rebuilding", order: 3 },
    ],
  },
];
