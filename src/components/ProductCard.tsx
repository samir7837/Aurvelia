import { Link } from "@tanstack/react-router";
import { productImage, formatINR, effectivePrice, type Product } from "@/lib/products";
import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.sale_price != null && product.sale_price < product.price;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg bg-secondary">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.new_arrival && (
            <Badge className="bg-primary text-primary-foreground">New</Badge>
          )}
          {onSale && (
            <Badge className="bg-clay text-clay-foreground">Sale</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-display text-lg leading-tight text-foreground">
          {product.name}
        </h3>
        <StarRating rating={product.rating} count={product.review_count} />
        <div className="flex items-center gap-2 pt-1">
          <span className="font-medium text-foreground">
            {formatINR(effectivePrice(product))}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
