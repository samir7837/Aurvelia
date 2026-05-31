import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Aurvelia" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/account", replace: true });
  }, [user, navigate]);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(form.get("name")) },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created! You're all set.");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Link to="/" className="mx-auto font-display text-3xl">AURVELIA</Link>
      <p className="mt-2 text-center text-muted-foreground">
        Your skincare journey starts here.
      </p>

      <Tabs defaultValue="signin" className="mt-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Create Account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={signIn} className="space-y-4 pt-6">
            <div>
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="si-pass">Password</Label>
              <Input id="si-pass" name="password" type="password" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Sign In
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={signUp} className="space-y-4 pt-6">
            <div>
              <Label htmlFor="su-name">Full name</Label>
              <Input id="su-name" name="name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="su-email">Email</Label>
              <Input id="su-email" name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="su-pass">Password</Label>
              <Input id="su-pass" name="password" type="password" minLength={6} required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Create Account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
