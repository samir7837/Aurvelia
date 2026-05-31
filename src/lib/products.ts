import serum from "@/assets/products/serum.jpg";
import cleanser from "@/assets/products/cleanser.jpg";
import moisturizer from "@/assets/products/moisturizer.jpg";
import sunscreen from "@/assets/products/sunscreen.jpg";
import toner from "@/assets/products/toner.jpg";
import mask from "@/assets/products/mask.jpg";
import lip from "@/assets/products/lip.jpg";
import body from "@/assets/products/body.jpg";

export const categoryImages: Record<string, string> = {
  serum,
  cleanser,
  moisturizer,
  sunscreen,
  toner,
  mask,
  lip,
  body,
};

export const categories = [
  { slug: "serum", label: "Serums" },
  { slug: "cleanser", label: "Cleansers" },
  { slug: "moisturizer", label: "Moisturizers" },
  { slug: "sunscreen", label: "Sunscreen" },
  { slug: "toner", label: "Toners" },
  { slug: "mask", label: "Masks" },
  { slug: "lip", label: "Lip Care" },
  { slug: "body", label: "Body" },
];

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  ingredients: string[];
  benefits: string[];
  skin_types: string[];
  skin_concerns: string[];
  how_to_use: string;
  images: string[];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
}

export function productImage(p: { category: string }) {
  return categoryImages[p.category] ?? serum;
}

export function formatINR(n: number) {
  return "₹" + new Intl.NumberFormat("en-IN").format(n);
}

export function effectivePrice(p: Product) {
  return p.sale_price ?? p.price;
}
