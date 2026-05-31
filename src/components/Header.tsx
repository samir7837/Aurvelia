import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, LogOut, LayoutDashboard, Heart, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/hooks/useCart";
import { categories } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                <Link to="/shop" onClick={() => setOpen(false)} className="py-2 font-display text-xl">
                  All Products
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/shop"
                    search={{ category: c.slug }}
                    onClick={() => setOpen(false)}
                    className="py-2 text-muted-foreground"
                  >
                    {c.label}
                  </Link>
                ))}
                <Link to="/about" onClick={() => setOpen(false)} className="py-2 text-muted-foreground">Our Story</Link>
                <Link to="/faq" onClick={() => setOpen(false)} className="py-2 text-muted-foreground">FAQ</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="py-2 text-muted-foreground">Contact</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            AURVELIA
          </Link>
        </div>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/shop" className="text-foreground/80 transition-colors hover:text-foreground">
            Shop All
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
          <Link to="/about" className="text-foreground/80 transition-colors hover:text-foreground">
            Our Story
          </Link>
          <Link to="/faq" className="text-foreground/80 transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link to="/contact" className="text-foreground/80 transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/wishlist" })}>
                  <Heart className="mr-2 h-4 w-4" /> Wishlist
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <Shield className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/login" })}>
              <User className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: "/cart" })}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-clay-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
