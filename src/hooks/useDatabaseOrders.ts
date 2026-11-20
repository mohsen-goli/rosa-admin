import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  DatabaseOrder,
  DatabaseOrderStatus,
} from "../types/databaseOrder";

interface OrderRow {
  id: string;
  user_id: string | null;
  code: string;
  currency: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  customer: Record<string, unknown> | null;
  created_at: string;
  order_items:
    | {
        id: string;
        product_id: string | null;
        product_snapshot: {
          title?: unknown;
          brand?: string;
        } | null;
        unit_price: number;
        quantity: number;
        line_total: number;
      }[]
    | null;
}

const validStatuses: DatabaseOrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getSnapshotProductName(title: unknown): string | undefined {
  if (typeof title === "string" && title.trim()) return title;
  if (!title || typeof title !== "object") return undefined;

  const translations = title as Record<string, unknown>;

  for (const locale of ["fa", "en", "ar"]) {
    const localized = translations[locale];

    if (typeof localized === "string" && localized.trim()) {
      return localized;
    }

    if (localized && typeof localized === "object") {
      const localizedTitle = (localized as Record<string, unknown>).title;

      if (typeof localizedTitle === "string" && localizedTitle.trim()) {
        return localizedTitle;
      }
    }
  }

  return undefined;
}

function mapOrder(row: OrderRow): DatabaseOrder {
  const customer = row.customer ?? {};
  const currency = row.currency === "USD" ? "USD" : "IRR";
  const status = validStatuses.includes(row.status as DatabaseOrderStatus)
    ? (row.status as DatabaseOrderStatus)
    : "pending";

  return {
    id: row.id,
    userId: row.user_id,
    orderCode: row.code,
    customerName: textValue(customer.name, "—"),
    customerEmail: textValue(customer.email) || null,
    customerPhone: textValue(customer.phone) || null,
    shippingAddress: [customer.city, customer.address, customer.postal]
      .filter(
        (part): part is string => typeof part === "string" && part.length > 0,
      )
      .join(" — "),
    status,
    paymentStatus: "not_recorded",
    currency,
    subtotal: Number(row.subtotal ?? 0),
    shippingFee: Number(row.shipping ?? 0),
    total: Number(row.total ?? 0),
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName:
        getSnapshotProductName(item.product_snapshot?.title) ??
        item.product_snapshot?.brand ??
        item.product_id ??
        "Product",
      unitPrice: Number(item.unit_price ?? 0),
      quantity: Number(item.quantity ?? 0),
      lineTotal: Number(item.line_total ?? 0),
    })),
  };
}

export function useDatabaseOrders() {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("orders")
      .select(
        `
        id, user_id, code, currency, status, subtotal, shipping, total,
        customer, created_at,
        order_items (id, product_id, product_snapshot, unit_price, quantity, line_total)
      `,
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setOrders(((data ?? []) as unknown as OrderRow[]).map(mapOrder));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
