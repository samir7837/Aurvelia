import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { formatINR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Aurvelia" }] }),
  component: AccountPage,
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
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  if (!user) return null;

  const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Hello, {name}</h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="pt-6">
          {orders.length === 0 ? (
            <div className="rounded-lg border border-border py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No orders yet.</p>
              <Button asChild className="mt-4"><Link to="/shop">Start shopping</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-lg border border-border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Order #{o.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{o.order_status}</Badge>
                      <span className="font-medium">{formatINR(o.total)}</span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                    {o.items.map((it, idx) => (
                      <span key={idx}>
                        {it.name} × {it.quantity}
                        {idx < o.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="pt-6">
          <div className="max-w-md space-y-4 rounded-lg border border-border p-6">
            <div>
              <p className="text-sm text-muted-foreground">Full name</p>
              <p className="font-medium">{name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
