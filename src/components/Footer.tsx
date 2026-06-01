import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { categories } from "@/lib/products";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
    const res = await fetch(apiUrl('/api/newsletter'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        toast.error('Could not subscribe. Try again.');
      } else {
        toast.success('Welcome to Aurvelia — check your inbox.');
        setEmail('');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Could not subscribe. Try again.');
    }
  };

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl">AURVELIA</h3>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Clinically-inspired skincare made in India. Honest formulas, transparent
              ingredients, and results you can feel.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                Subscribe
              </Button>
            </form>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Shop
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug }}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-foreground/80 hover:text-foreground">Our Story</Link></li>
              <li><Link to="/faq" className="text-foreground/80 hover:text-foreground">FAQ</Link></li>
              <li><Link to="/contact" className="text-foreground/80 hover:text-foreground">Contact</Link></li>
              <li><Link to="/account" className="text-foreground/80 hover:text-foreground">My Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aurvelia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
