export type ProductCategory =
  | "lipstick"
  | "skincare"
  | "perfume"
  | "haircare"
  | "makeup";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  emoji: string;
}
