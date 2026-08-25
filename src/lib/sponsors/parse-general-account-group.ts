/** Parsed `accountGroup` from a general allocation JSON blob. */
export type GeneralAccountGroup = {
  category: string;
  id: string;
};

/**
 * Extract `accountGroup` from allocation JSON if this row is a general allocation
 * (has `accountGroup`, no root `entity`).
 */
export function parseGeneralAccountGroup(allocation: unknown): GeneralAccountGroup | null {
  if (!allocation || typeof allocation !== "object") return null;
  const o = allocation as Record<string, unknown>;
  if (o["entity"] != null && typeof o["entity"] === "object") return null;
  const ag = o["accountGroup"];
  if (ag == null || typeof ag !== "object") return null;
  const g = ag as Record<string, unknown>;
  const category = g["category"];
  const id = g["id"];
  if (typeof category !== "string" || typeof id !== "string") return null;
  const c = category.trim();
  const i = id.trim();
  if (!c.length || !i.length) return null;
  return { category: c, id: i };
}
