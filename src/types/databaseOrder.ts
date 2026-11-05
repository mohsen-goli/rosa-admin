export type DatabaseOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface DatabaseOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface DatabaseOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string;
  status: DatabaseOrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: DatabaseOrderItem[];
}
