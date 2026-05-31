import { Star } from "lucide-react";

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-clay">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
