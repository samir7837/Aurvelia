import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, FlaskConical, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categories, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { categoryImages } from "@/lib/products";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurvelia — Clinically-Inspired Indian Skincare" },
      {
        name: "description",
        content:
          "Honest, results-driven skincare made in India. Serums, cleansers, moisturizers & SPF formulated with transparent, effective ingredients.",
      },
      { property: "og:title", content: "Aurvelia — Clinically-Inspired Indian Skincare" },
      {
        property: "og:description",
        content: "Honest, results-driven skincare made in India.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured = [] } = useQuery({
    queryKey: ["products", "featured-home"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("review_count", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-clay">
              Made in India
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-7xl">
              Skincare that
              <br />
              actually works.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Transparent, clinically-inspired formulas. No fluff, no false promises —
              just effective ingredients at honest prices.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/shop" search={{ category: "serum" }}>
                  Bestselling serums
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Aurvelia skincare collection"
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            { icon: FlaskConical, t: "Clinically inspired", d: "Backed by dermatology-led research" },
            { icon: Leaf, t: "Clean & cruelty-free", d: "No parabens, no animal testing" },
            { icon: ShieldCheck, t: "Honest pricing", d: "Premium actives, fair prices" },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <f.icon className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{f.t}</p>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl md:text-4xl">Shop by category</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-lg"
            >
              <img
                src={categoryImages[c.slug]}
                alt={c.label}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <span className="absolute bottom-3 left-3 font-display text-xl text-background">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">Bestsellers</h2>
          <Link to="/shop" className="text-sm text-clay hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
