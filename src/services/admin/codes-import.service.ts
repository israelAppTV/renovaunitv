import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductOption } from "@/services/admin/products-admin.service";
import {
  EXCEL_COL_ACTIVATION_TYPE,
  EXCEL_COL_CODE,
  EXCEL_SHEET_PREFERRED,
  normalizeActivationKind,
  type ActivationKind,
} from "@/services/admin/excel-codes.constants";

export interface ImportCodeRow {
  product_id: string;
  code: string;
}

export interface ParseExcelForImportResult {
  rows: ImportCodeRow[];
  issues: { rowNumber: number; message: string }[];
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function pickSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  if (workbook.SheetNames.includes(EXCEL_SHEET_PREFERRED)) {
    return workbook.Sheets[EXCEL_SHEET_PREFERRED] ?? null;
  }
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    if (rows.length > 0) return sheet;
  }
  return workbook.SheetNames[0]
    ? workbook.Sheets[workbook.SheetNames[0]] ?? null
    : null;
}

function resolveProductId(
  kind: ActivationKind,
  products: ProductOption[]
): string | null {
  const needle = kind === "monthly" ? "mensal" : "anual";
  const found = products.find((p) => p.name.toLowerCase().includes(needle));
  return found?.id ?? null;
}

export function parseExcelBufferForImport(
  buffer: Buffer,
  products: ProductOption[]
): ParseExcelForImportResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = pickSheet(workbook);
  if (!sheet) {
    return { rows: [], issues: [{ rowNumber: 0, message: "Planilha vazia." }] };
  }

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (json.length === 0) {
    return { rows: [], issues: [{ rowNumber: 0, message: "Nenhuma linha de dados." }] };
  }

  const sample = json[0];
  const keys = Object.keys(sample);
  const headerMap = new Map(keys.map((k) => [normalizeHeader(k), k]));

  const keyCode =
    headerMap.get(normalizeHeader(EXCEL_COL_CODE)) ??
    keys.find((k) => normalizeHeader(k).includes("código") || normalizeHeader(k).includes("codigo"));
  const keyType =
    headerMap.get(normalizeHeader(EXCEL_COL_ACTIVATION_TYPE)) ??
    keys.find((k) => normalizeHeader(k).includes("tipo"));

  if (!keyCode || !keyType) {
    return {
      rows: [],
      issues: [
        {
          rowNumber: 0,
          message:
            "Cabeçalhos não encontrados. Esperado: colunas de código e tipo de ativação.",
        },
      ],
    };
  }

  const rows: ImportCodeRow[] = [];
  const issues: { rowNumber: number; message: string }[] = [];

  json.forEach((record, index) => {
    const rowNumber = index + 2;
    const rawCode = String(record[keyCode] ?? "").trim();
    const rawType = String(record[keyType] ?? "").trim();
    if (!rawCode && !rawType) return;

    if (!rawCode) {
      issues.push({ rowNumber, message: "Linha sem código." });
      return;
    }
    if (!rawType) {
      issues.push({ rowNumber, message: "Linha sem tipo de ativação." });
      return;
    }

    const kind = normalizeActivationKind(rawType);
    if (!kind) {
      issues.push({
        rowNumber,
        message: `Tipo não reconhecido: "${rawType}".`,
      });
      return;
    }

    const productId = resolveProductId(kind, products);
    if (!productId) {
      issues.push({
        rowNumber,
        message: `Nenhum produto cadastrado para "${kind === "monthly" ? "mensal" : "anual"}".`,
      });
      return;
    }

    rows.push({ product_id: productId, code: rawCode });
  });

  return { rows, issues };
}

export async function runImportRpc(
  supabase: SupabaseClient,
  rows: ImportCodeRow[]
): Promise<{ data: unknown; error: Error | null }> {
  const payload = rows.map((r) => ({
    product_id: r.product_id,
    code: r.code,
  }));

  const { data, error } = await supabase.rpc("import_digital_codes_batch", {
    p_rows: payload,
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
}
