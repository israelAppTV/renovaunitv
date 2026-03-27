import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface ProductOption {
  id: string;
  name: string;
}

export async function listProductsForImport(): Promise<ProductOption[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  if (error) return [];
  return (data ?? []) as ProductOption[];
}
