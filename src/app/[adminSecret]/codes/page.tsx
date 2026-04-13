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
  const rawStatus = searchParams.status;
  const statusStr = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const statusFilter =
    statusStr === "available" || statusStr === "used" ? statusStr : undefined;

  const { rows, total, page: currentPage, pageSize, totalPages, summary } =
    await listDigitalCodesForAdmin({ page, status: statusFilter });
  const availableLow = summary.available > 0 && summary.available <= 10;
  const availableEmpty = summary.available === 0;

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
        <h2 className="text-lg font-semibold text-text">Resumo do estoque</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Link
            href={`/${adminSecret}/codes?status=available`}
            className={`rounded-xl border bg-card p-4 transition dark:border-gray-800 ${
              statusFilter === "available"
                ? "border-primary/70 ring-1 ring-primary/50"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-text/70">Disponíveis</p>
            <p className="mt-1 text-2xl font-bold text-text">{summary.available}</p>
          </Link>
          <Link
            href={`/${adminSecret}/codes?status=used`}
            className={`rounded-xl border bg-card p-4 transition dark:border-gray-800 ${
              statusFilter === "used"
                ? "border-primary/70 ring-1 ring-primary/50"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-text/70">Vendidos / usados</p>
            <p className="mt-1 text-2xl font-bold text-text">{summary.used}</p>
          </Link>
        </div>
        {statusFilter && (
          <div className="mt-3">
            <Link
              href={`/${adminSecret}/codes`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Limpar filtro e mostrar todos
            </Link>
          </div>
        )}
        {(availableEmpty || availableLow) && (
          <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {availableEmpty
              ? "Estoque disponível esgotado. Reabasteça importando novos códigos."
              : "Estoque disponível baixo. Recomendado reabastecer em breve."}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text">
          {statusFilter === "used"
            ? "Estoque importado — apenas vendidos/usados"
            : statusFilter === "available"
              ? "Estoque importado — apenas disponíveis"
              : "Estoque importado"}
        </h2>
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
          status={statusFilter}
        />
      </div>

      <AdminLogoutButton />
    </div>
  );
}
