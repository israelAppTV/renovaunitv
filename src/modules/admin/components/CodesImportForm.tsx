"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CodesImportForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes/import", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        summary?: { attempted?: number; inserted?: number; skipped?: number };
        issues?: { rowNumber: number; message: string }[];
      };
      if (!res.ok) {
        setError(json.error ?? "Falha na importação.");
        if (json.issues?.length) {
          setMessage(
            json.issues
              .slice(0, 8)
              .map((i) => `Linha ${i.rowNumber}: ${i.message}`)
              .join("\n")
          );
        }
        return;
      }
      const s = json.summary;
      const parts = [
        s?.inserted != null ? `Inseridos: ${s.inserted}` : null,
        s?.skipped != null ? `Ignorados (duplicados): ${s.skipped}` : null,
        s?.attempted != null ? `Linhas na planilha: ${s.attempted}` : null,
      ].filter(Boolean);
      setMessage(parts.join(" · "));
      if (json.issues?.length) {
        setMessage(
          (parts.join(" · ") || "Importação concluída.") +
            "\nAvisos: " +
            json.issues
              .slice(0, 5)
              .map((i) => `L${i.rowNumber}: ${i.message}`)
              .join("; ")
        );
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-card p-6 dark:border-gray-800"
    >
      <h2 className="text-lg font-semibold text-text">Importar Excel</h2>
      <p className="mt-1 text-sm text-text/70">
        Use a aba <code className="rounded bg-background px-1">code</code> ou a
        primeira aba com dados. Colunas: tipo de ativação e código.
      </p>
      <div className="mt-4">
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          className="text-sm text-text"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text disabled:opacity-50"
      >
        {loading ? "Importando…" : "Enviar planilha"}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {message && (
        <pre className="mt-3 whitespace-pre-wrap text-sm text-text/80">{message}</pre>
      )}
    </form>
  );
}
