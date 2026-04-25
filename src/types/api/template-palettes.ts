/** Root JSON body for GET /api/template-palettes/ui (200). */
export interface TemplatePalettesUiResponse {
  data: TemplatePaletteUiItem[];
}

/** One palette option in the catalog. */
export interface TemplatePaletteUiItem {
  id: number;
  name: string;
  ui: TemplatePaletteUiFields;
}

/** App-shaped palette fields (avoids a raw CMS field at the top level). */
export interface TemplatePaletteUiFields {
  /** CSS-ready colour string from CMS (e.g. `#0f4c81`). */
  value: string;
}
