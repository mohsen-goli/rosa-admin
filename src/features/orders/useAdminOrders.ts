import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type {
  DatabaseOrder,
  DatabaseOrderStatus,
  PaymentStatus,
} from "../../types/databaseOrder";

interface OrderRow {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string;
  status: DatabaseOrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] | null;
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        status,
        payment_status,
        subtotal,
        shipping_fee,
        total,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          line_total
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Admin orders fetch error:", fetchError);
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as OrderRow[];
    setOrders(rows.map((row) => ({
      id: row.id,
      orderNumber: Number(row.order_number),
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      shippingAddress: row.shipping_address,
      status: row.status,
      paymentStatus: row.payment_status,
      subtotal: Number(row.subtotal),
      shippingFee: Number(row.shipping_fee),
      total: Number(row.total),
      createdAt: row.created_at,
      items: (row.order_items ?? []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      })),
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load orders asynchronously after the component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
