import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, FlaskConical, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryContent {
  heading: string;
  body: string;
}

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Aurvelia Skincare" },
      {
        name: "description",
        content:
          "The story behind Aurvelia — honest, clinically-inspired skincare formulated and made in India.",
      },
      { property: "og:title", content: "Our Story — Aurvelia" },
      { property: "og:description", content: "Honest skincare, made in India." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: FlaskConical, title: "Clinically Inspired", text: "Proven actives at effective concentrations — no guesswork, no gimmicks." },
  { icon: Leaf, title: "Transparent Formulas", text: "Every ingredient listed, every claim backed. Nothing to hide." },
  { icon: ShieldCheck, title: "Barrier First", text: "Gentle, fragrance-conscious formulas that respect your skin barrier." },
  { icon: Heart, title: "Cruelty Free", text: "Never tested on animals, at any stage. Ever." },
];

function AboutPage() {
  const { data: story } = useQuery({
    queryKey: ["site_content", "our_story"],
    queryFn: async (): Promise<StoryContent | null> => {
      const res = await fetch('/api/site_content?key=our_story');
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.value as unknown as StoryContent) ?? null;
    },
  });

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Made in India</p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          {story?.heading ?? "Our Story"}
        </h1>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
          {story?.body ??
            "Aurvelia was born from a belief that effective skincare should be honest, accessible, and made for Indian skin."}
        </p>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl">What we stand for</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-background p-6">
                <v.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-xl">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-3xl">Ready to glow?</h2>
        <p className="mt-2 text-muted-foreground">Discover formulas your skin will thank you for.</p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/shop">Shop the range</Link>
        </Button>
      </section>
    </div>
  );
}
