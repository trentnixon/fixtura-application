export type TemplateBuilderPageHelpRoute = "template-builder";

/**
 * Map a scoped path rest segment to template-builder page-help content.
 * Returns null when the URL is outside the template builder area.
 */
export function getTemplateBuilderPageHelpRouteFromPathRest(
  rest: string,
): TemplateBuilderPageHelpRoute | null {
  if (rest === "template-builder") {
    return "template-builder";
  }
  return null;
}
