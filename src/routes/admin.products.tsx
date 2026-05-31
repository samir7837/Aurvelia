import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { formatINR, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch('/api/products?sort=name');
      if (!res.ok) throw new Error('Could not load products');
      return (await res.json()) as Product[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Product) => {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(`/api/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ price: p.price, sale_price: p.sale_price, stock: p.stock, is_active: p.is_active, featured: p.featured, best_seller: p.best_seller, new_arrival: p.new_arrival }) });
      if (!res.ok) throw new Error('Could not update product');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setEditing(null);
    },
    onError: () => toast.error("Could not update product"),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? "Loading…" : `${products.length} products`}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{p.category}</p>
                </TableCell>
                <TableCell>
                  {p.sale_price != null ? (
                    <span>
                      {formatINR(p.sale_price)}{" "}
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(p.price)}
                      </span>
                    </span>
                  ) : (
                    formatINR(p.price)
                  )}
                </TableCell>
                <TableCell>
                  <span className={p.stock <= 5 ? "font-medium text-clay" : ""}>{p.stock}</span>
                </TableCell>
                <TableCell>
                  {p.is_active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Hidden</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{editing.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sale price</Label>
                    <Input
                      type="number"
                      value={editing.sale_price ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          sale_price: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={editing.stock}
                      onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <ToggleRow
                    label="Active (visible in store)"
                    checked={editing.is_active}
                    onChange={(v) => setEditing({ ...editing, is_active: v })}
                  />
                  <ToggleRow
                    label="Featured"
                    checked={editing.featured}
                    onChange={(v) => setEditing({ ...editing, featured: v })}
                  />
                  <ToggleRow
                    label="Best seller"
                    checked={editing.best_seller}
                    onChange={(v) => setEditing({ ...editing, best_seller: v })}
                  />
                  <ToggleRow
                    label="New arrival"
                    checked={editing.new_arrival}
                    onChange={(v) => setEditing({ ...editing, new_arrival: v })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={() => save.mutate(editing)} disabled={save.isPending}>
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
