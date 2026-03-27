import Link from "next/link";
import { listDigitalCodesForAdmin } from "@/services/admin/codes-list.service";
import { CodesImportForm } from "@/modules/admin/components/CodesImportForm";
import { requireAdminSessionOrRedirect } from "@/services/admin/admin-session";
import { AdminLogoutButton } from "../components/AdminLogoutButton";
import { CodesPagination } from "./CodesPagination";

export const dynamic = "force-dynamic";

function statusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Disponível";
    case "reserved":
      return "Reservado";
    case "used":
      return "Vendido / entregue";
    default:
      return status;
  }
}

interface AdminCodesPageProps {
  params: { adminSecret: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminCodesPage({
  params,
  searchParams,
}: AdminCodesPageProps) {
  await requireAdminSessionOrRedirect();
  const { adminSecret } = params;

  const rawPage = searchParams.page;
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = parseInt(pageStr ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;

  const { rows, total, page: currentPage, pageSize, totalPages } =
    await listDigitalCodesForAdmin({ page });

  return (
    <div className="space-y-10 py-4">
      <div>
        <Link
          href={`/${adminSecret}`}
          className="text-sm text-primary hover:underline"
        >
          ← Painel
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text">Códigos digitais</h1>
        <p className="mt-1 text-sm text-text/70">
          Importação via Excel e listagem (acesso restrito).
        </p>
      </div>

      <CodesImportForm />

      <div>
        <h2 className="text-lg font-semibold text-text">Estoque importado</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text">Código</th>
                <th className="px-4 py-3 text-left font-medium text-text">Produto</th>
                <th className="px-4 py-3 text-left font-medium text-text">Status</th>
                <th className="px-4 py-3 text-left font-medium text-text">
                  Já vendido
                </th>
                <th className="px-4 py-3 text-left font-medium text-text">
                  Data uso
                </th>
                <th className="px-4 py-3 text-left font-medium text-text">
                  Data pedido
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-text/60"
                  >
                    Nenhum código cadastrado.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const sold = r.status === "used";
                  return (
                    <tr key={r.id} className="bg-card">
                      <td className="px-4 py-3 font-mono text-xs text-text">
                        {r.code}
                      </td>
                      <td className="px-4 py-3 text-text">{r.product_name}</td>
                      <td className="px-4 py-3 text-text">{statusLabel(r.status)}</td>
                      <td className="px-4 py-3 text-text">{sold ? "Sim" : "Não"}</td>
                      <td className="px-4 py-3 text-text">
                        {r.used_at
                          ? new Date(r.used_at).toLocaleString("pt-BR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-text">
                        {r.order_created_at
                          ? new Date(r.order_created_at).toLocaleString("pt-BR")
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <CodesPagination
          adminSecret={adminSecret}
          page={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
        />
      </div>

      <AdminLogoutButton />
    </div>
  );
}
