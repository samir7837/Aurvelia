import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import type { Product } from "@/lib/products";
import { apiUrl } from "@/lib/api";

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
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(apiUrl('/api/wishlist'), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load wishlist');
      const data = await res.json();
      return data as WishlistRow[];
    },
  });

  const ids = new Set(items.map((i) => i.product_id));

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('auth');
      const token = localStorage.getItem('aurvelia_token');
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        await fetch(apiUrl(`/api/wishlist/${existing.id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        return 'removed';
      }
      await fetch(apiUrl('/api/wishlist'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ product_id: productId }) });
      return 'added';
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
