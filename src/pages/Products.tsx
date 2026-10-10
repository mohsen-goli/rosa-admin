import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { mockProducts } from "../data/products";
import type { Product, ProductCategory } from "../types/product";

const categoryOptions: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "lipstick", label: "Lipstick" },
  { value: "skincare", label: "Skincare" },
  { value: "perfume", label: "Perfume" },
  { value: "haircare", label: "Haircare" },
  { value: "makeup", label: "Makeup" },
];

const categoryColors: Record<ProductCategory, string> = {
  lipstick: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  skincare: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  perfume:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  haircare:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  makeup: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

function getStockBadge(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    };
  }
  if (stock < 10) {
    return {
      label: `Low: ${stock}`,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    };
  }
  return {
    label: `In stock: ${stock}`,
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  };
}

export function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">(
    "all",
  );

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Products
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {filteredProducts.length} of {mockProducts.length} products
          </p>
        </div>
        <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Product
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
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-400 text-sm">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const stockBadge = getStockBadge(product.stock);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
          {product.emoji}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category]}`}
        >
          {product.category}
        </span>
      </div>

      <h3 className="font-semibold text-slate-800 dark:text-slate-100">
        {product.name}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {product.description}
      </p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            ${product.price}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${stockBadge.className}`}
          >
            {stockBadge.label}
          </span>
        </div>
        <button className="text-xs text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium">
          Edit →
        </button>
      </div>
    </div>
  );
}
