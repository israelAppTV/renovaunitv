"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export interface UseProductsParams {
  initialProducts: Product[];
  initialCategories: Category[];
  totalPages: number;
  currentPage: number;
  total: number;
  limit: number;
}

export interface UseProductsReturn {
  products: Product[];
  categories: Category[];
  categoryId: string | null;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  setCategory: (categoryId: string | null) => void;
  setPage: (page: number) => void;
}

export function useProducts({
  initialProducts,
  initialCategories,
  totalPages,
  currentPage,
  total,
  limit,
}: UseProductsParams): UseProductsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || null;

  const setCategory = useCallback(
    (categoryId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId) {
        params.set("category", categoryId);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push("/#planos", { scroll: true });
    },
    [router, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      router.push("/#planos", { scroll: true });
    },
    [router, searchParams]
  );

  return {
    products: initialProducts,
    categories: initialCategories,
    categoryId,
    page: currentPage,
    totalPages,
    total,
    limit,
    setCategory,
    setPage,
  };
}
