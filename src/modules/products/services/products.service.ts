import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

const DEFAULT_PAGE_SIZE = 12;

export interface GetProductsFilters {
  categoryId?: string | null;
  page?: number;
  limit?: number;
}

export interface GetProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProducts(
  filters: GetProductsFilters = {}
): Promise<GetProductsResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("id, category_id, name, description, price, image_url, is_active, stock_count, created_at, updated_at", {
      count: "exact",
    })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data ?? []) as Product[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at, updated_at")
    .order("name");

  if (error) {
    return [];
  }

  return (data ?? []) as Category[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, name, description, price, image_url, is_active, stock_count, created_at, updated_at")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Product;
}
