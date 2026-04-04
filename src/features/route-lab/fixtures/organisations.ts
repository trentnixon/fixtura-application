export type LabOrganisation = {
  id: string;
  name: string;
  sport?: string;
};

export const LAB_ORGANISATIONS_NONE: LabOrganisation[] = [];

export const LAB_ORGANISATIONS_ONE: LabOrganisation[] = [
  { id: "lab-1", name: "Demo Club", sport: "Rugby" },
];

export const LAB_ORGANISATIONS_MULTIPLE: LabOrganisation[] = [
  { id: "lab-1", name: "Eastern Eagles", sport: "AFL" },
  { id: "lab-2", name: "Westside Netball", sport: "Netball" },
  { id: "lab-3", name: "City Youth FC", sport: "Football" },
];
