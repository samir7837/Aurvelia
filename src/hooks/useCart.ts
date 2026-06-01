import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import type { Product } from "@/lib/products";
import { apiUrl, apiFetch } from "@/lib/api";

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
      const token = user?.id ? (localStorage.getItem('aurvelia_token') ?? null) : null;
      const res = await apiFetch('/api/cart', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load cart');
      const data = await res.json();
      return data as CartRow[];
    },
  });

  const add = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) throw new Error('auth');
      const token = localStorage.getItem('aurvelia_token');
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        await apiFetch(`/api/cart/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: existing.quantity + quantity }),
        });
      } else {
        await apiFetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId, quantity }),
        });
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
      const token = localStorage.getItem('aurvelia_token');
      if (quantity <= 0) {
        await apiFetch(`/api/cart/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      } else {
        await apiFetch(`/api/cart/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity }) });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('aurvelia_token');
      await apiFetch(`/api/cart/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from bag");
    },
  });

  const clear = async () => {
    if (!user) return;
    const token = localStorage.getItem('aurvelia_token');
    await apiFetch('/api/cart', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + (i.product.sale_price ?? i.product.price) * i.quantity,
    0,
  );

  return { items, isLoading, add, setQty, remove, clear, count, subtotal };
}
