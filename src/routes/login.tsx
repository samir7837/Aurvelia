import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

  const { signIn } = useAuth();

  const signInHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(form.get('email')), password: String(form.get('password')) }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return toast.error(data.message || 'Login failed');
      await signIn(data.token);
      toast.success('Welcome back!');
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || 'Login failed');
    }
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(form.get('email')), password: String(form.get('password')), full_name: String(form.get('name')) }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return toast.error(data.message || 'Create account failed');
      await signIn(data.token);
      toast.success("Account created! You're all set.");
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || 'Create account failed');
    }
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
          <form onSubmit={signInHandler} className="space-y-4 pt-6">
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
