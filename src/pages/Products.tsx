import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type FormEvent,
} from "react";
import { Search, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import type { ProductCategory } from "../types/product";

interface AdminProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  emoji: string;
  isActive: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: ProductCategory;
  imageUrl: string;
}

const categoryColors: Record<ProductCategory, string> = {
  lipstick: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  skincare: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  perfume:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  haircare:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  makeup: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

const categoryEmojis: Record<ProductCategory, string> = {
  lipstick: "💄",
  skincare: "🧴",
  perfume: "🌸",
  haircare: "🧖",
  makeup: "💋",
};

const inputClass =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500";

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "skincare",
  imageUrl: "",
};

export function Products() {
  const { t } = useTranslation();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editForm, setEditForm] = useState<ProductForm>(emptyForm);
  const [addForm, setAddForm] = useState<ProductForm>(emptyForm);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category, stock, image_url, is_active",
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProducts: AdminProduct[] = (data ?? []).map((row) => {
        const category = (
          row.category in categoryColors ? row.category : "makeup"
        ) as ProductCategory;

        return {
          id: String(row.id),
          name: row.name ?? "",
          description: row.description ?? "",
          price: Number(row.price ?? 0),
          category,
          stock: Number(row.stock ?? 0),
          imageUrl: row.image_url ?? "",
          emoji: categoryEmojis[category],
          isActive: Boolean(row.is_active),
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load products. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial product loading is asynchronous.
    // State updates happen as the request progresses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, [loadProducts]);

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);

    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl,
    });

    setSaveError("");
  };

  const validateForm = (form: ProductForm) => {
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return null;
    }

    return { price, stock };
  };

  const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingProduct) return;

    const values = validateForm(editForm);

    if (!values) {
      setSaveError("Please enter valid product information.");
      return;
    }

    if (!editForm.imageUrl.trim()) {
      setSaveError("Please enter a product image URL.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          price: values.price,
          stock: values.stock,
          category: editForm.category,
          image_url: editForm.imageUrl.trim(),
        })
        .eq("id", editingProduct.id);

      if (updateError) throw updateError;

      await loadProducts();
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Could not update product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const values = validateForm(addForm);

    if (!values) {
      setSaveError("Please enter valid product information.");
      return;
    }

    if (!addForm.imageUrl.trim()) {
      setSaveError("Please enter a product image URL.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const { error: insertError } = await supabase.from("products").insert({
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        price: values.price,
        stock: values.stock,
        category: addForm.category,
        image_url: addForm.imageUrl.trim(),
        is_active: true,
      });

      if (insertError) throw insertError;

      await loadProducts();
      setAddForm(emptyForm);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to create product:", err);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Could not create product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions: { value: ProductCategory | "all"; label: string }[] = [
    { value: "all", label: t("products.allCategories") },
    { value: "lipstick", label: t("products.categories.lipstick") },
    { value: "skincare", label: t("products.categories.skincare") },
    { value: "perfume", label: t("products.categories.perfume") },
    { value: "haircare", label: t("products.categories.haircare") },
    { value: "makeup", label: t("products.categories.makeup") },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return {
        label: t("products.outOfStock"),
        className:
          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      };
    }

    if (stock < 10) {
      return {
        label: t("products.lowStock", { count: stock }),
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      };
    }

    return {
      label: t("products.inStock", { count: stock }),
      className:
        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    };
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditingProduct(null);
    setSaveError("");
  };

  const closeAddModal = () => {
    if (isSaving) return;
    setIsAddModalOpen(false);
    setAddForm(emptyForm);
    setSaveError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {t("products.title")}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("products.count", {
              filtered: filteredProducts.length,
              total: products.length,
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSaveError("");
            setAddForm(emptyForm);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          {t("products.addProduct")}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as ProductCategory | "all")
          }
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 mt-4">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-red-200 dark:border-red-500/30 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => void loadProducts()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-400 text-sm">{t("products.noProducts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const stockBadge = getStockBadge(product.stock);

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      product.emoji
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${categoryColors[product.category]}`}
                    >
                      {t(`products.categories.${product.category}`)}
                    </span>

                    {!product.isActive && (
                      <span className="text-[10px] text-red-500">Inactive</span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      ${product.price}
                    </p>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 whitespace-nowrap ${stockBadge.className}`}
                    >
                      {stockBadge.label}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditModal(product)}
                    className="text-xs text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium whitespace-nowrap"
                  >
                    {t("products.edit")} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(editingProduct || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingProduct ? "Edit product" : "Add new product"}
              </h2>

              <button
                type="button"
                onClick={editingProduct ? closeEditModal : closeAddModal}
                disabled={isSaving}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleSaveProduct : handleAddProduct}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Product name
                </label>
                <input
                  className={inputClass}
                  value={editingProduct ? editForm.name : addForm.name}
                  onChange={(e) =>
                    editingProduct
                      ? setEditForm({ ...editForm, name: e.target.value })
                      : setAddForm({ ...addForm, name: e.target.value })
                  }
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
                  value={
                    editingProduct ? editForm.description : addForm.description
                  }
                  onChange={(e) =>
                    editingProduct
                      ? setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      : setAddForm({
                          ...addForm,
                          description: e.target.value,
                        })
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
                    value={editingProduct ? editForm.price : addForm.price}
                    onChange={(e) =>
                      editingProduct
                        ? setEditForm({ ...editForm, price: e.target.value })
                        : setAddForm({ ...addForm, price: e.target.value })
                    }
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
                    value={editingProduct ? editForm.stock : addForm.stock}
                    onChange={(e) =>
                      editingProduct
                        ? setEditForm({ ...editForm, stock: e.target.value })
                        : setAddForm({ ...addForm, stock: e.target.value })
                    }
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
                  value={editingProduct ? editForm.category : addForm.category}
                  onChange={(e) =>
                    editingProduct
                      ? setEditForm({
                          ...editForm,
                          category: e.target.value as ProductCategory,
                        })
                      : setAddForm({
                          ...addForm,
                          category: e.target.value as ProductCategory,
                        })
                  }
                >
                  {categoryOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                  value={editingProduct ? editForm.imageUrl : addForm.imageUrl}
                  onChange={(e) =>
                    editingProduct
                      ? setEditForm({ ...editForm, imageUrl: e.target.value })
                      : setAddForm({ ...addForm, imageUrl: e.target.value })
                  }
                  required
                />

                {(editingProduct ? editForm.imageUrl : addForm.imageUrl) && (
                  <img
                    src={editingProduct ? editForm.imageUrl : addForm.imageUrl}
                    alt="Product preview"
                    className="mt-3 w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                )}
              </div>

              {saveError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                  {saveError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={editingProduct ? closeEditModal : closeAddModal}
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
                  {isSaving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
