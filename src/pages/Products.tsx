import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import type { ProductCategory } from "../types/product";

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  brandName: string;
  category: ProductCategory;
  priceIrr: number | null;
  priceUsdCents: number | null;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  rating: number | null;
  slug: string;
}

const categoryColors: Record<ProductCategory, string> = {
  lipstick: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  skincare: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  perfume: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  haircare: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  makeup: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

const categoryEmojis: Record<ProductCategory, string> = {
  lipstick: "💄",
  skincare: "🧴",
  perfume: "🌸",
  haircare: "🧖",
  makeup: "💋",
};

const getReadableError = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [value.message, value.details, value.hint]
      .filter((part): part is string => typeof part === "string" && part.length > 0);
    if (parts.length) return [value.code, ...parts]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" — ");
  }
  return typeof error === "string" && error ? error : "Could not load products. Please try again.";
};

const formatPrice = (amount: number | null, currency: "IRR" | "USD") => {
  if (amount === null) return "—";
  const value = currency === "USD" ? amount / 100 : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
};

export function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data: baseRows, error: productsError } = await supabase
        .from("products")
        .select("id, brand_id, slug, category, is_active, rating, created_at")
        .order("created_at", { ascending: false });
      if (productsError) throw productsError;

      const rows = baseRows ?? [];
      const productIds = rows.map((row) => row.id);
      const brandIds = [...new Set(rows.map((row) => row.brand_id).filter(Boolean))];

      if (productIds.length === 0) {
        setProducts([]);
        return;
      }

      const [translationsResult, variantsResult, imagesResult, brandsResult] = await Promise.all([
        supabase.from("product_translations").select("product_id, lang, title, description").in("product_id", productIds),
        supabase.from("product_variants").select("product_id, price_irr, price_usd_cents, stock, is_active, sort_order").in("product_id", productIds).order("sort_order", { ascending: true }),
        supabase.from("product_images").select("product_id, image_url, is_primary, sort_order").in("product_id", productIds).order("sort_order", { ascending: true }),
        brandIds.length
          ? supabase.from("brands").select("id, name").in("id", brandIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (translationsResult.error) throw translationsResult.error;
      if (variantsResult.error) throw variantsResult.error;
      if (imagesResult.error) throw imagesResult.error;
      if (brandsResult.error) throw brandsResult.error;

      const translations = translationsResult.data ?? [];
      const variants = variantsResult.data ?? [];
      const images = imagesResult.data ?? [];
      const brands = brandsResult.data ?? [];

      const mapped: AdminProduct[] = rows.map((row) => {
        const productTranslations = translations.filter((item) => item.product_id === row.id);
        const preferred = productTranslations.find((item) => item.lang === i18n.language)
          ?? productTranslations.find((item) => item.lang === "en")
          ?? productTranslations.find((item) => item.lang === "fa")
          ?? productTranslations[0];
        const productVariants = variants.filter((item) => item.product_id === row.id && item.is_active);
        const pricedVariant = productVariants.find((item) => item.price_usd_cents !== null)
          ?? productVariants[0];
        const productImage = images.find((item) => item.product_id === row.id && item.is_primary)
          ?? images.find((item) => item.product_id === row.id);
        const brand = brands.find((item) => item.id === row.brand_id);
        const category = (row.category in categoryColors ? row.category : "makeup") as ProductCategory;

        return {
          id: String(row.id),
          slug: row.slug ?? "",
          name: preferred?.title ?? row.slug ?? "Untitled product",
          description: preferred?.description ?? "",
          brandName: brand?.name ?? "",
          category,
          priceIrr: pricedVariant?.price_irr ?? null,
          priceUsdCents: pricedVariant?.price_usd_cents ?? null,
          stock: productVariants.reduce((sum, item) => sum + Number(item.stock ?? 0), 0),
          imageUrl: productImage?.image_url ?? "",
          isActive: Boolean(row.is_active),
          rating: row.rating === null ? null : Number(row.rating),
        };
      });
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load ROSA products:", err);
      setError(getReadableError(err));
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categoryOptions: { value: ProductCategory | "all"; label: string }[] = [
    { value: "all", label: t("products.allCategories") },
    { value: "lipstick", label: t("products.categories.lipstick") },
    { value: "skincare", label: t("products.categories.skincare") },
    { value: "perfume", label: t("products.categories.perfume") },
    { value: "haircare", label: t("products.categories.haircare") },
    { value: "makeup", label: t("products.categories.makeup") },
  ];

  const filteredProducts = useMemo(() => products.filter((product) => {
    const term = search.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(term)
      || product.description.toLowerCase().includes(term)
      || product.brandName.toLowerCase().includes(term)
      || product.slug.toLowerCase().includes(term);
    return matchesSearch && (categoryFilter === "all" || product.category === categoryFilter);
  }), [products, search, categoryFilter]);

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: t("products.outOfStock"), className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    if (stock < 10) return { label: t("products.lowStock", { count: stock }), className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" };
    return { label: t("products.inStock", { count: stock }), className: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("products.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("products.count", { filtered: filteredProducts.length, total: products.length })}</p>
        </div>
        <button type="button" onClick={() => void loadProducts()} disabled={isLoading} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("products.searchPlaceholder")} className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ProductCategory | "all")} className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200">
          {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
          <button onClick={() => void loadProducts()} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">Try again</button>
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
              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : categoryEmojis[product.category]}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${categoryColors[product.category]}`}>{t(`products.categories.${product.category}`)}</span>
                    {!product.isActive && <span className="text-[10px] text-red-500">Inactive</span>}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</h3>
                {product.brandName && <p className="text-xs text-pink-500 mt-1">{product.brandName}</p>}
                {product.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{product.priceUsdCents !== null ? formatPrice(product.priceUsdCents, "USD") : formatPrice(product.priceIrr, "IRR")}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 whitespace-nowrap ${stockBadge.className}`}>{stockBadge.label}</span>
                  </div>
                  {product.rating !== null && <span className="text-xs text-slate-500">★ {product.rating.toFixed(1)}</span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-3">{product.slug}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
