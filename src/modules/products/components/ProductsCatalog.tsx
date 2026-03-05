"use client";

import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { GetProductsResult } from "../services/products.service";

interface ProductsCatalogProps {
  initialData: GetProductsResult;
  categories: Category[];
}

export function ProductsCatalog({ initialData, categories }: ProductsCatalogProps) {
  const {
    products,
    categories: cats,
    categoryId,
    page,
    totalPages,
    total,
    setCategory,
    setPage,
  } = useProducts({
    initialProducts: initialData.products,
    initialCategories: categories,
    totalPages: initialData.totalPages,
    currentPage: initialData.page,
    total: initialData.total,
    limit: initialData.limit,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Categoria:
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategory(e.target.value || null)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">Todas</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {total} {total === 1 ? "produto" : "produtos"}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          Nenhum produto encontrado.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: Product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 pt-4"
              aria-label="Paginação"
            >
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
