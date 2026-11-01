import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { ProductCategory } from "../types/product";

interface AddProductModalProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: ProductCategory;
  imageUrl: string;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500";

export function AddProductModal({ onClose, onCreated }: AddProductModalProps) {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "skincare",
    imageUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Please enter valid product information.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("products").insert({
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        stock,
        category: form.category,
        image_url: form.imageUrl.trim(),
        is_active: true,
      });

      if (insertError) throw insertError;

      await onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not create product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2
            id="add-product-title"
            className="text-lg font-bold text-slate-800 dark:text-slate-100"
          >
            Add new product
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Product name
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Price ($)
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Stock
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as ProductCategory,
                })
              }
            >
              <option value="lipstick">Lipstick</option>
              <option value="skincare">Skincare</option>
              <option value="perfume">Perfume</option>
              <option value="haircare">Haircare</option>
              <option value="makeup">Makeup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Product image URL
            </label>
            <input
              className={inputClass}
              type="url"
              placeholder="https://example.com/product.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Enter a direct, publicly accessible image link.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-60"
            >
              {isSaving ? "Adding..." : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
