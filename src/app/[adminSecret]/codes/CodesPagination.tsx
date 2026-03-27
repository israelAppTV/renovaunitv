import Link from "next/link";

interface CodesPaginationProps {
  adminSecret: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function CodesPagination({
  adminSecret,
  page,
  totalPages,
  total,
  pageSize,
}: CodesPaginationProps) {
  if (total === 0) return null;

  const base = `/${adminSecret}/codes`;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text/70">
        Mostrando{" "}
        <span className="font-medium text-text">
          {from}–{to}
        </span>{" "}
        de <span className="font-medium text-text">{total}</span> códigos
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {prev != null ? (
          <Link
            href={prev === 1 ? base : `${base}?page=${prev}`}
            className="rounded-lg border border-gray-300 bg-background px-3 py-1.5 text-sm font-medium text-text transition hover:bg-primary/10 dark:border-gray-600"
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-text/40">
            Anterior
          </span>
        )}
        <span className="text-sm text-text/80">
          Página {page} de {totalPages}
        </span>
        {next != null ? (
          <Link
            href={`${base}?page=${next}`}
            className="rounded-lg border border-gray-300 bg-background px-3 py-1.5 text-sm font-medium text-text transition hover:bg-primary/10 dark:border-gray-600"
          >
            Próxima
          </Link>
        ) : (
          <span className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-text/40">
            Próxima
          </span>
        )}
      </div>
    </div>
  );
}
