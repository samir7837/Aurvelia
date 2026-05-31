import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import type { Product } from "@/lib/products";

export interface CartRow {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CartRow[]> => {
      const { data: cart, error } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity")
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!cart?.length) return [];
      const ids = cart.map((c) => c.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);
      return cart
        .map((c) => ({
          ...c,
          product: products?.find((p) => p.id === c.product_id) as Product,
        }))
        .filter((c) => c.product);
    },
  });

  const add = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) throw new Error("auth");
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: productId, quantity });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to bag");
    },
    onError: (e: Error) =>
      toast.error(e.message === "auth" ? "Please sign in first" : "Could not add to bag"),
  });

  const setQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from bag");
    },
  });

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + (i.product.sale_price ?? i.product.price) * i.quantity,
    0,
  );

  return { items, isLoading, add, setQty, remove, clear, count, subtotal };
}
