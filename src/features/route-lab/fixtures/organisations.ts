export type LabOrganisation = {
  id: string;
  name: string;
  sport?: string;
  /** Mirrors account row flags for status rows on the tile. */
  isActive?: boolean;
  isSetup?: boolean;
  /** Optional logo URL for the org visual (production uses ParentLogo). */
  logo?: string;
};

export const LAB_ORGANISATIONS_NONE: LabOrganisation[] = [];

export const LAB_ORGANISATIONS_ONE: LabOrganisation[] = [
  { id: "lab-1", name: "Demo Club", sport: "Rugby", isActive: true, isSetup: true },
];

export const LAB_ORGANISATIONS_MULTIPLE: LabOrganisation[] = [
  { id: "lab-1", name: "Eastern Eagles", sport: "AFL", isActive: true, isSetup: true },
  { id: "lab-2", name: "Westside Netball", sport: "Netball", isActive: false, isSetup: true },
  { id: "lab-3", name: "City Youth FC", sport: "Football", isActive: true, isSetup: false },
];
