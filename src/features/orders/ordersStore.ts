import { create } from "zustand";
import { mockOrders } from "../../data/orders";
import type { Order } from "../../types/order";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: mockOrders,

  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: `ord-${String(state.orders.length + 1).padStart(3, "0")}`,
        },
      ],
    })),

  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order,
      ),
    })),

  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    })),
}));
