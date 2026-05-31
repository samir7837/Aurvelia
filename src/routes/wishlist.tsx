import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Aurvelia" },
      { name: "description", content: "Your saved Aurvelia skincare favourites." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const { items, isLoading } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl md:text-5xl">My Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        {isLoading ? "Loading…" : `${items.length} saved item${items.length === 1 ? "" : "s"}`}
      </p>

      {!isLoading && items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-border py-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">You haven't saved anything yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Explore products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {items.map((i) => (
            <ProductCard key={i.id} product={i.product} />
          ))}
        </div>
      )}
    </div>
  );
}
