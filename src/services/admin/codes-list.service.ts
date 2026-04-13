import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface AdminDigitalCodeRow {
  id: string;
  code: string;
  status: "available" | "reserved" | "used";
  product_id: string;
  product_name: string;
  used_at: string | null;
  order_created_at: string | null;
}

export interface ListDigitalCodesPageResult {
  rows: AdminDigitalCodeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    available: number;
    used: number;
  };
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function listDigitalCodesForAdmin(options: {
  page?: number;
  pageSize?: number;
  status?: "available" | "used";
} = {}): Promise<ListDigitalCodesPageResult> {
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  const requestedPage = Math.max(1, Math.floor(options.page ?? 1));

  const supabase = createServiceRoleClient();
  const countByStatus = async (status: AdminDigitalCodeRow["status"]) => {
    const { count: scopedCount } = await supabase
      .from("digital_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    return scopedCount ?? 0;
  };

  const [availableCount, usedCount] = await Promise.all([
    countByStatus("available"),
    countByStatus("used"),
  ]);

  const countQuery = supabase
    .from("digital_codes")
    .select("id", { count: "exact", head: true });
  if (options.status) {
    countQuery.eq("status", options.status);
  }
  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = total === 0 ? 1 : Math.min(requestedPage, totalPages);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const rowsQuery = supabase
    .from("digital_codes")
    .select("id, code, status, product_id, used_at, used_by_order")
    .order("created_at", { ascending: false });
  if (options.status) {
    rowsQuery.eq("status", options.status);
  }
  const { data: codes, error } = await rowsQuery.range(from, to);

  if (error) {
    return {
      rows: [],
      total,
      page,
      pageSize,
      totalPages,
      summary: {
        available: availableCount,
        used: usedCount,
      },
    };
  }

  const list = codes ?? [];
  if (list.length === 0) {
    return {
      rows: [],
      total,
      page,
      pageSize,
      totalPages,
      summary: {
        available: availableCount,
        used: usedCount,
      },
    };
  }

  const productIds = Array.from(new Set(list.map((c) => c.product_id)));
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  const nameByProductId = new Map(
    (products ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
  );

  const orderIds = Array.from(
    new Set(
      list
        .map((c) => c.used_by_order)
        .filter((id): id is string => id != null)
    )
  );

  let orderDates = new Map<string, string>();
  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, created_at")
      .in("id", orderIds);
    if (orders) {
      orderDates = new Map(
        orders.map((o: { id: string; created_at: string }) => [o.id, o.created_at])
      );
    }
  }

  const rows = list.map((row) => {
    const usedBy = row.used_by_order as string | null;
    return {
      id: row.id as string,
      code: row.code as string,
      status: row.status as AdminDigitalCodeRow["status"],
      product_id: row.product_id as string,
      product_name: nameByProductId.get(row.product_id as string) ?? "—",
      used_at: (row.used_at as string | null) ?? null,
      order_created_at: usedBy ? orderDates.get(usedBy) ?? null : null,
    };
  });

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages,
    summary: {
      available: availableCount,
      used: usedCount,
    },
  };
}
