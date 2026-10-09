import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { useOrdersStore } from "../features/orders/ordersStore";
import { OrdersTable } from "../features/orders/OrdersTable";
import { OrderFormModal } from "../features/orders/OrderFormModal";
import type { Order, OrderStatus } from "../types/order";

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function Orders() {
  const orders = useOrdersStore((state) => state.orders);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const updateOrder = useOrdersStore((state) => state.updateOrder);
  const deleteOrder = useOrdersStore((state) => state.deleteOrder);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(
    undefined,
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.product.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 mt-1">
            {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOrder(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Order
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, product or order ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "all")
          }
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <OrdersTable
        orders={filteredOrders}
        onDelete={deleteOrder}
        onEdit={(order) => {
          setEditingOrder(order);
          setIsModalOpen(true);
        }}
      />

      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          if (editingOrder) {
            updateOrder(editingOrder.id, data);
          } else {
            addOrder(data);
          }
        }}
        initialOrder={editingOrder}
      />
    </div>
  );
}
