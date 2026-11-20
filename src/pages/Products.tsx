import { useState, useMemo, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { Search, Plus, X, Upload, RefreshCw, Power, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import type { ProductCategory } from "../types/product";

type Lang = "fa" | "en" | "ar";
type TranslationForm = Record<Lang, { title: string; description: string }>;

interface Brand { id: string; name: string }
interface ProductVariant {
  id: string; sku: string; price_irr: number | null; price_usd_cents: number | null; stock: number;
}
interface AdminProduct {
  id: string; slug: string; brandId: string; brandName: string; category: ProductCategory;
  isActive: boolean; rating: number | null; imageUrl: string; imageId: string | null; translations: TranslationForm;
  variants: ProductVariant[];
}
interface ProductForm {
  translations: TranslationForm; brandId: string; category: ProductCategory;
  priceIrr: string; priceUsd: string; stock: string; imageUrl: string; sku: string;
}
const languages: Lang[] = ["fa", "en", "ar"];
const emptyTranslations: TranslationForm = {
  fa: { title: "", description: "" },
  en: { title: "", description: "" },
  ar: { title: "", description: "" },
};
const emptyForm: ProductForm = {
  translations: emptyTranslations, brandId: "", category: "skincare",
  priceIrr: "", priceUsd: "", stock: "0", imageUrl: "", sku: "",
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const categoryColors: Record<ProductCategory, string> = {
  skincare: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  perfume: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  haircare: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  makeup: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};
const categoryEmojis: Record<ProductCategory, string> = {
  skincare: "🧴", perfume: "🌸", haircare: "🧖", makeup: "💋",
};
const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500";

const getReadableError = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [value.message, value.details, value.hint].filter((part): part is string => typeof part === "string" && part.length > 0);
    if (parts.length) return [value.code, ...parts].filter((part): part is string => typeof part === "string" && part.length > 0).join(" — ");
  }
  return typeof error === "string" && error ? error : "Something went wrong. Please try again.";
};
const formatPrice = (amount: number | null, currency: "IRR" | "USD") => {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(currency === "USD" ? amount / 100 : amount);
};
const makeSlug = (value: string) => value.normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const readImagePreview = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not preview image."));
  reader.onerror = () => reject(new Error("Could not read image."));
  reader.readAsDataURL(file);
});
const uploadProductImage = async (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Please select a JPG, PNG or WebP image.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size must be less than 5 MB.");
  const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const path = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("products").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
};

export function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // The user explicitly approved product management against the connected ROSA Supabase project.
  const canWriteProducts = import.meta.env.VITE_ENABLE_PRODUCT_WRITES === "true";

  const fetchProducts = useCallback(async () => {
    try {
      // Fetch products and their related data in one request to avoid multiple
      // network round trips before the product grid can render.
      const [productsResult, brandsResult] = await Promise.all([
        supabase.from("products")
          .select(`
            id, brand_id, slug, category, is_active, rating, created_at,
            brand:brands!products_brand_id_fkey (id, name),
            translations:product_translations (id, lang, title, description),
            variants:product_variants (id, sku, price_irr, price_usd_cents, stock, is_active, sort_order),
            images:product_images (id, image_url, is_primary, sort_order)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("brands").select("id, name").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (productsResult.error) throw productsResult.error;
      if (brandsResult.error) throw brandsResult.error;
      setError("");
      setBrands(brandsResult.data ?? []);
      const mapped: AdminProduct[] = (productsResult.data ?? []).map((row) => {
        const translations = { ...emptyTranslations };
        for (const lang of languages) {
          const item = row.translations?.find((x) => x.lang === lang);
          if (item) translations[lang] = { title: item.title ?? "", description: item.description ?? "" };
        }
        const variants = (row.variants ?? [])
          .filter((x) => x.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((x) => ({
            id: x.id, sku: x.sku ?? "", price_irr: x.price_irr === null ? null : Number(x.price_irr),
            price_usd_cents: x.price_usd_cents === null ? null : Number(x.price_usd_cents), stock: Number(x.stock ?? 0),
          }));
        const image = row.images?.find((x) => x.is_primary)
          ?? [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
        return {
          id: row.id, slug: row.slug ?? "", brandId: row.brand_id ?? "", brandName: row.brand?.name ?? "",
          category: (row.category in categoryColors ? row.category : "makeup") as ProductCategory,
          isActive: Boolean(row.is_active), rating: row.rating === null ? null : Number(row.rating),
          imageUrl: image?.image_url ?? "", imageId: image?.id ?? null, translations, variants,
        };
      });
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load ROSA products:", err);
      setError(getReadableError(err));
    } finally { setIsLoading(false); }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return fetchProducts();
      return undefined;
    });
    return () => { cancelled = true; };
  }, [fetchProducts]);

  const activeLanguage = (["fa", "en", "ar"].includes(i18n.language.split("-")[0]) ? i18n.language.split("-")[0] : "en") as Lang;
  const filteredProducts = useMemo(() => products.filter((p) => {
    const title = p.translations[activeLanguage].title || p.translations.en.title || p.translations.fa.title;
    const term = search.toLowerCase();
    return (title.toLowerCase().includes(term) || p.brandName.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term))
      && (categoryFilter === "all" || p.category === categoryFilter);
  }), [products, search, categoryFilter, activeLanguage]);
  const categoryOptions: { value: ProductCategory | "all"; label: string }[] = [
    { value: "all", label: t("products.allCategories") },
    { value: "skincare", label: t("products.categories.skincare") },
    { value: "perfume", label: t("products.categories.perfume") },
    { value: "haircare", label: t("products.categories.haircare") },
    { value: "makeup", label: t("products.categories.makeup") },
  ];
  const resetModal = () => { setEditingProduct(null); setIsAddOpen(false); setForm(emptyForm); setImageFile(null); setImagePreview(""); setSaveError(""); };
  const openAdd = () => { resetModal(); setIsAddOpen(true); };
  const openEdit = (product: AdminProduct) => {
    const variant = product.variants[0];
    setEditingProduct(product); setIsAddOpen(false);
    setForm({
      translations: product.translations, brandId: product.brandId, category: product.category,
      priceIrr: variant?.price_irr == null ? "" : String(variant.price_irr),
      priceUsd: variant?.price_usd_cents == null ? "" : String(variant.price_usd_cents / 100),
      stock: String(variant?.stock ?? 0), imageUrl: product.imageUrl, sku: variant?.sku ?? `${product.id}-default`,
    });
    setImageFile(null); setImagePreview(""); setSaveError("");
  };
  const setTranslation = (lang: Lang, key: "title" | "description", value: string) => {
    setForm((prev) => ({ ...prev, translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [key]: value } } }));
  };
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Please select a JPG, PNG or WebP image.");
      if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size must be less than 5 MB.");
      setImagePreview(await readImagePreview(file)); setImageFile(file); setSaveError("");
    } catch (err) { setSaveError(getReadableError(err)); event.target.value = ""; }
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canWriteProducts) {
      setSaveError("Product changes are disabled in Preview because it is connected to the live store database.");
      return;
    }
    const enTitle = form.translations.en.title.trim();
    const faTitle = form.translations.fa.title.trim();
    const sku = form.sku.trim();
    const stock = Number(form.stock);
    const irr = form.priceIrr.trim() === "" ? null : Number(form.priceIrr);
    const usd = form.priceUsd.trim() === "" ? null : Math.round(Number(form.priceUsd) * 100);
    if (!enTitle || !faTitle || !sku || !Number.isInteger(stock) || stock < 0 ||
      (irr === null || !Number.isSafeInteger(irr) || irr < 0) ||
      (usd !== null && (!Number.isSafeInteger(usd) || usd < 0)) || (irr === null && usd === null)) {
      setSaveError("Please enter Persian and English titles, SKU, a valid stock, a valid IRR price and (optionally) a valid USD price."); return;
    }
    if (!imageFile && !form.imageUrl.trim()) { setSaveError("Please select a product image or enter an image URL."); return; }
    setIsSaving(true); setSaveError("");
    try {
      const imageUrl = imageFile ? await uploadProductImage(imageFile) : form.imageUrl.trim();
      let productId = editingProduct?.id;
      const slugBase = makeSlug(enTitle) || `rosa-product-${Date.now()}`;
      if (!editingProduct) {
        productId = `rosa-${crypto.randomUUID()}`;
        const { error: insertError } = await supabase.from("products").insert({
          id: productId, slug: `${slugBase}-${Date.now().toString().slice(-5)}`,
          brand_id: form.brandId || null, category: form.category, is_active: true,
        });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase.from("products").update({
          brand_id: form.brandId || null, category: form.category, updated_at: new Date().toISOString(),
        }).eq("id", editingProduct.id);
        if (updateError) throw updateError;
      }

      for (const lang of languages) {
        const value = form.translations[lang];
        const { data: existing, error: findError } = await supabase.from("product_translations")
          .select("id").eq("product_id", productId!).eq("lang", lang).maybeSingle();
        if (findError) throw findError;
        if (!value.title.trim()) {
          if (existing?.id) {
            const { error: deleteError } = await supabase.from("product_translations").delete().eq("id", existing.id);
            if (deleteError) throw deleteError;
          }
          continue;
        }
        const payload = { title: value.title.trim(), description: value.description.trim() || null };
        const result = existing?.id
          ? await supabase.from("product_translations").update(payload).eq("id", existing.id)
          : await supabase.from("product_translations").insert({ product_id: productId!, lang, ...payload });
        if (result.error) throw result.error;
      }

      const variant = editingProduct?.variants[0];
      const variantPayload = {
        sku, option_values: { label: "Default" }, price_irr: irr, price_usd_cents: usd,
        stock, is_active: true, sort_order: 0,
      };
      const variantResult = variant?.id
        ? await supabase.from("product_variants").update(variantPayload).eq("id", variant.id)
        : await supabase.from("product_variants").insert({ product_id: productId!, ...variantPayload });
      if (variantResult.error) throw variantResult.error;

      if (editingProduct?.imageId) {
        const { error: imageUpdateError } = await supabase.from("product_images")
          .update({ image_url: imageUrl, is_primary: true, sort_order: 0 })
          .eq("id", editingProduct.imageId);
        if (imageUpdateError) throw imageUpdateError;
      } else {
        const { error: imageInsertError } = await supabase.from("product_images").insert({
          product_id: productId!, image_url: imageUrl, is_primary: true, sort_order: 0,
        });
        if (imageInsertError) throw imageInsertError;
      }

      await loadProducts();
      resetModal();
    } catch (err) {
      console.error("Failed to save ROSA product:", err);
      setSaveError(getReadableError(err));
    } finally { setIsSaving(false); }
  };

  const toggleActive = async (product: AdminProduct) => {
    if (!canWriteProducts) {
      setError("Product activation changes are disabled in Preview while it shares the live store database.");
      return;
    }
    const action = product.isActive ? "deactivate" : "activate";
    if (product.isActive && !window.confirm("Deactivate this product? It will be hidden from the store but kept in the database and order history.")) return;
    try {
      const { error: updateError } = await supabase.from("products").update({ is_active: !product.isActive, updated_at: new Date().toISOString() }).eq("id", product.id);
      if (updateError) throw updateError;
      await loadProducts();
    } catch (err) { setError(`Could not ${action} product: ${getReadableError(err)}`); }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: t("products.outOfStock"), className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    if (stock < 10) return { label: t("products.lowStock", { count: stock }), className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" };
    return { label: t("products.inStock", { count: stock }), className: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" };
  };

  const modalOpen = Boolean(editingProduct) || isAddOpen;
  return (
    <div className="space-y-6">
      {!canWriteProducts && <p className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-3 text-xs text-amber-800 dark:text-amber-300">Preview is read-only because it uses the live ROSA database. Product editing will be enabled in Production only after an explicit environment setting.</p>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("products.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("products.count", { filtered: filteredProducts.length, total: products.length })}</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadProducts()} disabled={isLoading} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"><RefreshCw size={16} className={isLoading ? "animate-spin" : ""}/>Refresh</button>
          <button type="button" onClick={openAdd} disabled={!canWriteProducts} title={!canWriteProducts ? "Preview is connected to the live database; writes are disabled." : undefined} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={16}/>{t("products.addProduct")}</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("products.searchPlaceholder")} className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"/></div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "all")} className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200">
          {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      </div>
      {isLoading ? <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center"><div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/><p className="text-sm text-slate-400 mt-4">Loading products...</p></div>
      : error ? <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-red-200 text-center"><p className="text-sm text-red-500 mb-4">{error}</p><button onClick={() => void loadProducts()} className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm">Try again</button></div>
      : filteredProducts.length === 0 ? <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center"><p className="text-slate-400 text-sm">{t("products.noProducts")}</p></div>
      : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredProducts.map((product) => {
          const lang = product.translations[activeLanguage].title ? activeLanguage : product.translations.en.title ? "en" : "fa";
          const title = product.translations[lang].title || product.slug;
          const variant = product.variants[0];
          const stockBadge = getStockBadge(variant?.stock ?? 0);
          return <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4 gap-2"><div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0 overflow-hidden">{product.imageUrl ? <img src={product.imageUrl} alt={title} className="w-full h-full object-cover"/> : categoryEmojis[product.category]}</div>
              <div className="flex flex-col items-end gap-1"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category]}`}>{t(`products.categories.${product.category}`)}</span>{!product.isActive && <span className="text-[10px] text-red-500">Inactive</span>}</div></div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>{product.brandName && <p className="text-xs text-pink-500 mt-1">{product.brandName}</p>}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"><div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{variant?.price_usd_cents != null ? formatPrice(variant.price_usd_cents, "USD") : formatPrice(variant?.price_irr ?? null, "IRR")}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] mt-1 ${stockBadge.className}`}>{stockBadge.label}</span></div>
              <div className="flex flex-col gap-2 items-end"><button onClick={() => openEdit(product)} disabled={!canWriteProducts || product.variants.length > 1} title={product.variants.length > 1 ? "This product has multiple variants; edit is disabled to avoid changing the wrong variant." : undefined} className="flex items-center gap-1 text-xs text-pink-500 font-medium disabled:opacity-40 disabled:cursor-not-allowed"><Pencil size={13}/>Edit</button>
                <button onClick={() => void toggleActive(product)} disabled={!canWriteProducts} className={`flex items-center gap-1 text-xs ${product.isActive ? "text-red-500" : "text-green-600"} disabled:opacity-40 disabled:cursor-not-allowed`}><Power size={13}/>{product.isActive ? "Deactivate" : "Activate"}</button></div></div>
            <p className="text-[10px] text-slate-400 mt-3">{product.slug}</p>
          </div>;
        })}
      </div>}
      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
        <div role="dialog" aria-modal="true" className="w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{editingProduct ? "Edit product" : "Add new product"}</h2>
            <button type="button" onClick={resetModal} disabled={isSaving} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button></div>
          <form onSubmit={saveProduct} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {languages.map((lang) => <section key={lang} className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{lang.toUpperCase()} {lang === "fa" ? "(Persian)" : lang === "en" ? "(English)" : "(Arabic)"}</h3>
                <input className={inputClass} dir={lang === "en" ? "ltr" : "auto"} placeholder={`${lang.toUpperCase()} product title`} value={form.translations[lang].title} onChange={(e) => setTranslation(lang, "title", e.target.value)} required={lang !== "ar"}/>
                <textarea className={inputClass} rows={3} dir={lang === "en" ? "ltr" : "auto"} placeholder="Description (optional)" value={form.translations[lang].description} onChange={(e) => setTranslation(lang, "description", e.target.value)}/>
              </section>)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-slate-600 dark:text-slate-300">Brand<select className={inputClass} value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}><option value="">No brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
              <label className="text-sm text-slate-600 dark:text-slate-300">Category<select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>{categoryOptions.filter((x) => x.value !== "all").map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-slate-600 dark:text-slate-300">SKU<input className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required/></label>
              <label className="text-sm text-slate-600 dark:text-slate-300">Stock (units)<input className={inputClass} type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required/></label>
              <label className="text-sm text-slate-600 dark:text-slate-300">Price (IRR)<input className={inputClass} type="number" min="0" step="1" value={form.priceIrr} onChange={(e) => setForm({ ...form, priceIrr: e.target.value })} placeholder="e.g. 598500"/></label>
              <label className="text-sm text-slate-600 dark:text-slate-300">Price (USD)<input className={inputClass} type="number" min="0" step="0.01" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} placeholder="e.g. 12.99"/></label>
            </div>
            <section className="space-y-3"><label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Product image</label>
              <label className="flex flex-col items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-pink-300 dark:border-pink-500/40 rounded-xl cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-500/5"><Upload size={24} className="text-pink-500"/><span className="text-sm text-pink-600">Choose image from computer</span><span className="text-xs text-slate-400">JPG, PNG or WebP · Maximum 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void handleImageChange(e)} disabled={isSaving}/></label>
              {(imagePreview || form.imageUrl) && <img src={imagePreview || form.imageUrl} alt="Product preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200"/>}
              <input className={inputClass} type="url" placeholder="Or paste a public image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}/>
            </section>
            {editingProduct && editingProduct.variants.length > 1 && <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg">This product has multiple active variants. The current editor changes the first variant only; other variants are preserved.</p>}
            {saveError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">{saveError}</p>}
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={resetModal} disabled={isSaving} className="px-4 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300">Cancel</button>
              <button type="submit" disabled={isSaving || !canWriteProducts} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-60">{isSaving ? "Saving..." : editingProduct ? "Save changes" : "Add product"}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
