import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { categories, type Product } from "@/lib/products";
import { apiUrl, apiFetch } from "@/lib/api";
import fallbackProducts from "@/lib/fallback/products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShopSearch {
  category?: string;
  sort?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All — Aurvelia Skincare" },
      { name: "description", content: "Browse the full Aurvelia skincare range — serums, cleansers, moisturizers, sunscreen and more." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "shop", category, sort],
    // Always use local fallbackProducts as the primary data source
    queryFn: async (): Promise<Product[]> => {
      const list = fallbackProducts.filter((p) => p.is_active && (!category || p.category === category));
      // client-side sorting
      const sorted = [...list];
      if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
      else sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      return sorted;
    },
  });

  const activeLabel = categories.find((c) => c.slug === category)?.label;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl">
          {activeLabel ?? "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? "Loading…" : `${products.length} products`}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
              <Button
                variant={!category ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => navigate({ search: (p: ShopSearch) => ({ ...p, category: undefined }) })}
              >
                All
              </Button>
              {categories.map((c) => (
                <Button
                  key={c.slug}
                  variant={category === c.slug ? "default" : "ghost"}
                  size="sm"
                  className="justify-start"
                  onClick={() => navigate({ search: (p: ShopSearch) => ({ ...p, category: c.slug }) })}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="mb-6 flex justify-end">
            <Select
              value={sort ?? "popular"}
              onValueChange={(v) =>
                navigate({ search: (p: ShopSearch) => ({ ...p, sort: v === "popular" ? undefined : v }) })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 && !isLoading ? (
            <p className="text-muted-foreground">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
