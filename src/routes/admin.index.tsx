import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Mail,
  Star,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/products";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  created_at: string;
}

function AdminOverview() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, order_status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OrderRow[];
    },
  });

  const { data: productCount = 0 } = useQuery({
    queryKey: ["admin", "product-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, slug")
        .lte("stock", 5)
        .order("stock", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["admin", "subscriber-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["admin", "review-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);

  const stats = [
    { label: "Revenue", value: formatINR(revenue), icon: IndianRupee },
    { label: "Orders", value: orders.length, icon: ShoppingCart },
    { label: "Products", value: productCount, icon: Package },
    { label: "Subscribers", value: subscriberCount, icon: Mail },
    { label: "Reviews", value: reviewCount, icon: Star },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-border p-5">
          <h2 className="font-display text-xl">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">#{o.order_number}</span>
                  <span className="capitalize text-muted-foreground">{o.order_status}</span>
                  <span className="font-medium">{formatINR(Number(o.total))}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/orders" className="mt-4 inline-block text-sm text-primary hover:underline">
            View all orders →
          </Link>
        </section>

        <section className="rounded-xl border border-border p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <AlertTriangle className="h-5 w-5 text-clay" /> Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">All products are well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "font-medium text-destructive" : "text-clay"}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/products" className="mt-4 inline-block text-sm text-primary hover:underline">
            Manage inventory →
          </Link>
        </section>
      </div>
    </div>
  );
}
