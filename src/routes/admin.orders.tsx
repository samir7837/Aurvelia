import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: { full_name?: string; city?: string; state?: string };
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders-full"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders-full"] });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Could not update order"),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? "Loading…" : `${orders.length} orders`}
      </p>

      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">Order #{o.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {o.shipping_address?.full_name ? ` · ${o.shipping_address.full_name}` : ""}
                  {o.shipping_address?.city ? `, ${o.shipping_address.city}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {o.payment_status}
                </Badge>
                <span className="font-medium">{formatINR(Number(o.total))}</span>
                <Select
                  value={o.order_status}
                  onValueChange={(status) => updateStatus.mutate({ id: o.id, status })}
                >
                  <SelectTrigger className="w-36 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
              {o.items?.map((it, i) => (
                <span key={i}>
                  {it.name} × {it.quantity}
                  {i < o.items.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
        {!isLoading && orders.length === 0 && (
          <p className="text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
