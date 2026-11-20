import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type RealOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type OrderCurrency = "IRR" | "USD";

export interface RealOrder {
  id: string;
  code: string;
  currency: OrderCurrency;
  total: number;
  status: RealOrderStatus;
  createdAt: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
}

interface OrderRow {
  id: string;
  code: string;
  currency: string;
  total: number | string;
  status: string;
  created_at: string;
  user_id: string | null;
  customer: { name?: string; email?: string; phone?: string } | null;
  order_items: { quantity: number | string }[] | null;
}

const validStatuses: RealOrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function useRealOrders() {
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("orders")
      .select("id, code, currency, total, status, created_at, user_id, customer, order_items(quantity)")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as OrderRow[];
    setError(null);
    setOrders(rows.flatMap((row) => {
      const currency = row.currency.toUpperCase();
      if (currency !== "IRR" && currency !== "USD") return [];
      if (!validStatuses.includes(row.status as RealOrderStatus)) return [];
      return [{
        id: row.id,
        code: row.code,
        currency,
        total: Number(row.total) || 0,
        status: row.status as RealOrderStatus,
        createdAt: row.created_at,
        userId: row.user_id,
        customerName: row.customer?.name?.trim() || "Guest customer",
        customerEmail: row.customer?.email?.trim().toLowerCase() || "",
        customerPhone: row.customer?.phone?.trim() || "",
        itemCount: (row.order_items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
      }];
    }));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase.channel("rosa-admin-dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh]);

  return { orders, loading, error, refresh };
}
