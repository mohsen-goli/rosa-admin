export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  product: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: number;
  notes?: string;
}
