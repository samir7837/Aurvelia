import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import type { Product } from "@/lib/products";

export interface WishlistRow {
  id: string;
  product_id: string;
  product: Product;
}

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WishlistRow[]> => {
      const { data: rows, error } = await supabase
        .from("wishlist_items")
        .select("id, product_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!rows?.length) return [];
      const ids = rows.map((r) => r.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);
      return rows
        .map((r) => ({
          ...r,
          product: products?.find((p) => p.id === r.product_id) as Product,
        }))
        .filter((r) => r.product);
    },
  });

  const ids = new Set(items.map((i) => i.product_id));

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("auth");
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return "removed";
      }
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return "added";
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(result === "added" ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: (e: Error) =>
      toast.error(e.message === "auth" ? "Please sign in first" : "Something went wrong"),
  });

  return { items, isLoading, toggle, has: (id: string) => ids.has(id), count: items.length };
}
