import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Order, OrderStatus } from "../../types/order";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Omit<Order, "id">) => void;
  initialOrder?: Order;
}

const inputClass =
  "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500";

const labelClass =
  "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

export function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialOrder,
}: OrderFormModalProps) {
  const { t } = useTranslation();

  const emptyForm: Omit<Order, "id"> = {
    customerName: "",
    customerEmail: "",
    product: "",
    amount: 0,
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    items: 1,
  };

  const [form, setForm] = useState<Omit<Order, "id">>(emptyForm);

  useEffect(() => {
    if (initialOrder) {
      const { id, ...rest } = initialOrder;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {initialOrder
              ? t("orders.form.editTitle")
              : t("orders.form.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>
              {t("orders.form.customerName")}
            </label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("orders.form.customerEmail")}
            </label>
            <input
              type="email"
              required
              value={form.customerEmail}
              onChange={(e) =>
                setForm({ ...form, customerEmail: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("orders.form.product")}</label>
            <input
              type="text"
              required
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("orders.form.amount")}</label>
              <input
                type="number"
                required
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("orders.form.items")}</label>
              <input
                type="number"
                required
                min={1}
                value={form.items}
                onChange={(e) =>
                  setForm({ ...form, items: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("orders.form.status")}</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as OrderStatus })
              }
              className={inputClass}
            >
              <option value="pending">{t("orders.status.pending")}</option>
              <option value="shipped">{t("orders.status.shipped")}</option>
              <option value="delivered">{t("orders.status.delivered")}</option>
              <option value="cancelled">{t("orders.status.cancelled")}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t("orders.form.date")}</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t("orders.form.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {initialOrder ? t("orders.form.update") : t("orders.form.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
