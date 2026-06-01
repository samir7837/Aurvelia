import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth";
import { useCart } from "@/hooks/useCart";
import {
  productImage,
  formatINR,
  effectivePrice,
  type Product,
} from "@/lib/products";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { WishlistButton } from "@/components/WishlistButton";
import { apiUrl } from "@/lib/api";

export const Route = createFileRoute("/product/$slug")({
  component: ProductDetail,
});

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  author_name: string;
  verified_purchase: boolean;
  created_at: string;
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const res = await fetch(apiUrl(`/api/products?slug=${encodeURIComponent(slug)}`));
      if (!res.ok) return null;
      const data = await res.json();
      return (data && data.length ? data[0] : null) as Product | null;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product,
    queryFn: async (): Promise<Review[]> => {
      const res = await fetch(apiUrl(`/api/reviews?product_id=${product!.id}`));
      if (!res.ok) return [];
      return (await res.json()) as Review[];
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">Loading…</div>;
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Button asChild className="mt-6">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const onSale = product.sale_price != null && product.sale_price < product.price;

  const handleAdd = () => {
    if (!user) {
      toast.error("Please sign in to shop");
      navigate({ to: "/login" });
      return;
    }
    add.mutate({ productId: product.id, quantity: qty });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" search={{ category: product.category }} className="capitalize hover:text-foreground">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-secondary">
          <img
            src={productImage(product)}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} count={product.review_count} />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-medium">{formatINR(effectivePrice(product))}</span>
            {onSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatINR(product.price)}
              </span>
            )}
            {onSale && <Badge className="bg-clay text-clay-foreground">Sale</Badge>}
          </div>

          <p className="mt-5 text-muted-foreground">{product.description}</p>

          {product.benefits?.length > 0 && (
            <ul className="mt-5 space-y-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1" onClick={handleAdd} disabled={product.stock <= 0}>
              {product.stock <= 0 ? "Out of stock" : "Add to bag"}
            </Button>
          </div>
          <div className="mt-3">
            <WishlistButton productId={product.id} variant="full" className="w-full" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}
          </p>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="ingredients">
              <AccordionTrigger>Key Ingredients</AccordionTrigger>
              <AccordionContent>{product.ingredients?.join(", ")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="how">
              <AccordionTrigger>How to use</AccordionTrigger>
              <AccordionContent>{product.how_to_use}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="suited">
              <AccordionTrigger>Suited for</AccordionTrigger>
              <AccordionContent>
                Skin types: {product.skin_types?.join(", ")}
                <br />
                Concerns: {product.skin_concerns?.join(", ")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Separator className="my-14" />

      <ReviewsSection
        productId={product.id}
        reviews={reviews}
        onAdded={() => {
          qc.invalidateQueries({ queryKey: ["reviews", product.id] });
        }}
      />
    </div>
  );
}

function ReviewsSection({
  productId,
  reviews,
  onAdded,
}: {
  productId: string;
  reviews: Review[];
  onAdded: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to write a review");
      return;
    }
    if (!comment.trim()) return;
    setSubmitting(true);
    const authorName =
      (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Customer";
    try {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(apiUrl('/api/reviews'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ product_id: productId, user_id: user.id, rating, comment, author_name: authorName }) });
      if (!res.ok) {
        throw new Error('Could not submit review');
      }
    } catch (err) {
      setSubmitting(false);
      toast.error('Could not submit review');
      return;
    }
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit review");
    } else {
      toast.success("Thanks for your review!");
      setComment("");
      setRating(5);
      onAdded();
    }
  };

  return (
    <section>
      <h2 className="font-display text-3xl">Reviews ({reviews.length})</h2>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {reviews.length === 0 && (
            <p className="text-muted-foreground">No reviews yet. Be the first!</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.author_name}</p>
                {r.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="mt-1">
                <StarRating rating={r.rating} />
              </div>
              {r.title && <p className="mt-2 font-medium">{r.title}</p>}
              <p className="mt-1 text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="h-fit rounded-lg border border-border p-6">
          <h3 className="font-display text-xl">Write a review</h3>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={n <= rating ? "text-clay" : "text-muted-foreground"}
              >
                ★
              </button>
            ))}
          </div>
          <Textarea
            className="mt-4"
            placeholder="Share your experience…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="mt-4 w-full" disabled={submitting}>
            Submit review
          </Button>
          {!user && (
            <p className="mt-2 text-xs text-muted-foreground">You must be signed in.</p>
          )}
        </form>
      </div>
    </section>
  );
}
