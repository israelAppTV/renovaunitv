import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionFromCookies } from "@/services/admin/admin-session";
import { listProductsForImport } from "@/services/admin/products-admin.service";
import {
  parseExcelBufferForImport,
  runImportRpc,
} from "@/services/admin/codes-import.service";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await verifyAdminSessionFromCookies())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const products = await listProductsForImport();

  if (products.length === 0) {
    return NextResponse.json(
      { error: "Cadastre produtos antes de importar códigos." },
      { status: 400 }
    );
  }

  const parsed = parseExcelBufferForImport(buffer, products);

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        issues: parsed.issues,
        summary: null,
      },
      { status: 400 }
    );
  }

  const { data, error } = await runImportRpc(
    createServiceRoleClient(),
    parsed.rows
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const secret = process.env.ADMIN_PANEL_SECRET;
  if (secret) {
    revalidatePath(`/${secret}/codes`);
    revalidatePath(`/${secret}`);
  }

  return NextResponse.json({
    ok: true,
    issues: parsed.issues,
    summary: data,
  });
}
