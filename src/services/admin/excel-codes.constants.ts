/** Colunas esperadas na planilha exportada (aba `code` ou primeira com dados). */
export const EXCEL_COL_CODE = "Código de ativação";
export const EXCEL_COL_ACTIVATION_TYPE = "Tipo de código de ativação";
export const EXCEL_SHEET_PREFERRED = "code";

export type ActivationKind = "monthly" | "annual";

export function normalizeActivationKind(raw: string): ActivationKind | null {
  const t = raw.trim().toLowerCase();
  if (t.includes("mensal") || t.includes("monthly")) return "monthly";
  if (t.includes("anual") || t.includes("annual")) return "annual";
  return null;
}
