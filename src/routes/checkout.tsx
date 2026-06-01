import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiUrl, apiFetch } from "@/lib/api";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Aurvelia" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login", replace: true });
  }, [user, navigate]);

  const shipping = subtotal > 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    const fd = new FormData(e.currentTarget);
    setProcessing(true);

    // Mock payment gateway delay
    await new Promise((r) => setTimeout(r, 1500));

    const orderNumber = "AUR" + Date.now().toString().slice(-8);
    const address = {
      full_name: String(fd.get("full_name")),
      phone: String(fd.get("phone")),
      line1: String(fd.get("line1")),
      line2: String(fd.get("line2")),
      city: String(fd.get("city")),
      state: String(fd.get("state")),
      pincode: String(fd.get("pincode")),
    };
    const orderItems = items.map((i) => ({
      product_id: i.product_id,
      name: i.product.name,
      slug: i.product.slug,
      category: i.product.category,
      price: i.product.sale_price ?? i.product.price,
      quantity: i.quantity,
    }));

    try {
      const token = localStorage.getItem('aurvelia_token');
      const res = await apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ user_id: user.id, order_number: orderNumber, items: orderItems, subtotal, tax, shipping_fee: shipping, total, shipping_address: address, payment_method: payment, payment_status: 'paid', order_status: 'confirmed', transaction_id: 'TXN' + Math.random().toString(36).slice(2, 11).toUpperCase(), payment_id: 'PAY' + Math.random().toString(36).slice(2, 11).toUpperCase() }) });
      if (!res.ok) {
        setProcessing(false);
        toast.error('Payment failed. Please try again.');
        return;
      }
    } catch (err) {
      setProcessing(false);
      toast.error('Payment failed. Please try again.');
      return;
    }

    await clear();
    setProcessing(false);
    toast.success("Order placed successfully!");
    navigate({ to: "/account" });
  };

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl">Nothing to checkout</h1>
        <Button asChild className="mt-6"><Link to="/shop">Shop now</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="full_name" label="Full name" required />
              <Field name="phone" label="Phone" required />
              <div className="sm:col-span-2"><Field name="line1" label="Address line 1" required /></div>
              <div className="sm:col-span-2"><Field name="line2" label="Address line 2" /></div>
              <Field name="city" label="City" required />
              <Field name="state" label="State" required />
              <Field name="pincode" label="PIN code" required />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Payment method</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
              {[
                { v: "upi", l: "UPI", d: "Pay via GPay, PhonePe, Paytm" },
                { v: "card", l: "Credit / Debit Card", d: "Visa, Mastercard, RuPay" },
                { v: "cod", l: "Cash on Delivery", d: "Pay when it arrives" },
              ].map((p) => (
                <label key={p.v} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary">
                  <RadioGroupItem value={p.v} id={p.v} />
                  <div>
                    <p className="font-medium">{p.l}</p>
                    <p className="text-sm text-muted-foreground">{p.d}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <p className="mt-3 text-xs text-muted-foreground">
              This is a demo store — a mock payment gateway is used. No real charges occur.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-secondary/30 p-6">
          <h2 className="font-display text-2xl">Your order</h2>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {i.product.name} × {i.quantity}
                </span>
                <span>{formatINR((i.product.sale_price ?? i.product.price) * i.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
            <Row label="GST (18%)" value={formatINR(tax)} />
            <Separator className="my-2" />
            <Row label="Total" value={formatINR(total)} bold />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={processing}>
            {processing ? "Processing payment…" : `Pay ${formatINR(total)}`}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} className="mt-1" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-medium text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
