export type OrderStatus = "PENDING" | "PAID" | "CODE_ASSIGNED" | "COMPLETED";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  updated_at: string;
}
