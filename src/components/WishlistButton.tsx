import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WishlistButton({
  productId,
  className,
  variant = "icon",
}: {
  productId: string;
  className?: string;
  variant?: "icon" | "full";
}) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const active = has(productId);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    toggle.mutate(productId);
  };

  if (variant === "full") {
    return (
      <Button type="button" variant="outline" size="lg" onClick={handle} className={className}>
        <Heart className={cn("mr-2 h-4 w-4", active && "fill-clay text-clay")} />
        {active ? "Saved" : "Save to wishlist"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active ? "fill-clay text-clay" : "text-foreground")} />
    </button>
  );
}
