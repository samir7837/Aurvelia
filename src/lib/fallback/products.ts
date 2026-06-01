import serum from "@/assets/products/serum.jpg";
import cleanser from "@/assets/products/cleanser.jpg";
import moisturizer from "@/assets/products/moisturizer.jpg";
import sunscreen from "@/assets/products/sunscreen.jpg";
import toner from "@/assets/products/toner.jpg";
import mask from "@/assets/products/mask.jpg";
import lip from "@/assets/products/lip.jpg";
import body from "@/assets/products/body.jpg";
import type { Product } from "@/lib/products";

const categoryImageMap: Record<string, string> = {
  serum,
  cleanser,
  moisturizer,
  sunscreen,
  toner,
  mask,
  lip,
  body,
};

const categories = [
  "serum",
  "cleanser",
  "moisturizer",
  "sunscreen",
  "toner",
  "mask",
  "lip",
  "body",
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const fallbackProducts: Product[] = categories.flatMap((cat) =>
  Array.from({ length: 5 }).map((_, i) => {
    const index = i + 1;
    const id = `${cat}-${index}`;
    const sku = `AURV-${cat.slice(0, 3).toUpperCase()}-${String(index).padStart(2, "0")}`;
    const name = `${cap(cat)} ${index}`;
    return {
      id,
      sku,
      name,
      slug: `${cat}-${index}`,
      category: cat,
      brand: "Aurvelia",
      description: `${cap(cat)} product ${index} from the Aurvelia premium lineup.`,
      price: 399 + (i + categories.indexOf(cat)) * 25,
      sale_price: null,
      stock: 50 + i * 10,
      ingredients: ["Water", "Glycerin"],
      benefits: ["Hydration"],
      skin_types: ["All"],
      skin_concerns: ["General"],
      how_to_use: "Use as directed.",
      images: [categoryImageMap[cat]],
      featured: false,
      best_seller: i === 0,
      new_arrival: false,
      is_active: true,
      rating: 4.5,
      review_count: 10 + i * 5,
    } as Product;
  })
);

export default fallbackProducts;
