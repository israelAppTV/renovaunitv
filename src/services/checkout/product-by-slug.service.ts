import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  slug: string | null;
  is_active: boolean;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, slug, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProductRow;
}

export async function countAvailableCodes(productId: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from("digital_codes")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("status", "available");

  if (error) return 0;
  return count ?? 0;
}
