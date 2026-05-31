import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/hooks/useCart";
import { productImage, formatINR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — Aurvelia" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const { items, setQty, remove, subtotal, isLoading } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">Your bag</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your bag.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/login" })}>Sign In</Button>
      </div>
    );
  }

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Your bag</h1>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-10">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Button asChild className="mt-6"><Link to="/shop">Continue shopping</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {items.map((i) => (
              <div key={i.id} className="flex gap-4">
                <Link to="/product/$slug" params={{ slug: i.product.slug }}>
                  <img
                    src={productImage(i.product)}
                    alt={i.product.name}
                    className="h-28 w-24 rounded-lg object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link to="/product/$slug" params={{ slug: i.product.slug }} className="font-display text-lg">
                      {i.product.name}
                    </Link>
                    <button onClick={() => remove.mutate(i.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm capitalize text-muted-foreground">{i.product.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty.mutate({ id: i.id, quantity: i.quantity - 1 })}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty.mutate({ id: i.id, quantity: i.quantity + 1 })}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-medium">
                      {formatINR((i.product.sale_price ?? i.product.price) * i.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-secondary/30 p-6">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
              <Row label="GST (18%)" value={formatINR(tax)} />
              <Separator className="my-2" />
              <Row label="Total" value={formatINR(total)} bold />
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate({ to: "/checkout" })}>
              Proceed to checkout
            </Button>
            {shipping > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Add {formatINR(1000 - subtotal)} more for free shipping.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-medium text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
