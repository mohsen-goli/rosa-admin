import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Order, OrderStatus } from '../../types/order';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Omit<Order, 'id'>) => void;
  initialOrder?: Order;
}

const emptyForm: Omit<Order, 'id'> = {
  customerName: '',
  customerEmail: '',
  product: '',
  amount: 0,
  status: 'pending',
  date: new Date().toISOString().split('T')[0],
  items: 1,
};

export function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialOrder,
}: OrderFormModalProps) {
  const [form, setForm] = useState<Omit<Order, 'id'>>(emptyForm);

  useEffect(() => {
    if (initialOrder) {
      const { id, ...rest } = initialOrder;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [initialOrder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialOrder ? 'Edit Order' : 'Add New Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              required
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Product
            </label>
            <input
              type="text"
              required
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Items
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.items}
                onChange={(e) =>
                  setForm({ ...form, items: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as OrderStatus })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {initialOrder ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}