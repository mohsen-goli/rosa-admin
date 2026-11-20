export type DatabaseOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "not_recorded";

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
  userId: string | null;
  orderCode: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string;
  status: DatabaseOrderStatus;
  paymentStatus: PaymentStatus;
  currency: "IRR" | "USD";
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: DatabaseOrderItem[];
}