import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string;
  author_name: string;
  verified_purchase: boolean;
  created_at: string;
}

function AdminReviews() {
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async (): Promise<(ReviewRow & { productName: string })[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as ReviewRow[];
      const ids = Array.from(new Set(rows.map((r) => r.product_id)));
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", ids);
      return rows.map((r) => ({
        ...r,
        productName: products?.find((p) => p.id === r.product_id)?.name ?? "Unknown product",
      }));
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review removed");
    },
    onError: () => toast.error("Could not remove review"),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? "Loading…" : `${reviews.length} reviews`}
      </p>

      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.author_name}</p>
                  {r.verified_purchase && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">on {r.productName}</p>
                <div className="mt-1">
                  <StarRating rating={r.rating} />
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(r.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && reviews.length === 0 && (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
