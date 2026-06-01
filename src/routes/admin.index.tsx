import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ShoppingCart, Package, Mail, Star, AlertTriangle } from "lucide-react";
import { apiUrl } from "@/lib/api";
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
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(apiUrl('/api/admin/orders'), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load orders');
      const data = await res.json();
      return data as OrderRow[];
    },
  });

  const { data: statsData = { products: 0, subscribers: 0, reviews: 0 } } = useQuery<any>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(apiUrl('/api/admin/stats'), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load stats');
      return await res.json();
    },
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin", "products-all"],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) throw new Error('Could not load products');
      return await res.json();
    },
  });

  const productCount = statsData.products ?? 0;
  const subscriberCount = statsData.subscribers ?? 0;
  const reviewCount = statsData.reviews ?? 0;
  const lowStock = allProducts.filter((p: any) => p.stock <= 5).sort((a: any, b: any) => a.stock - b.stock);

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
