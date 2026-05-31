import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Aurvelia Skincare" },
      {
        name: "description",
        content:
          "Answers to common questions about Aurvelia products, shipping, returns and ingredients.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Aurvelia" },
      { property: "og:description", content: "Everything you need to know about Aurvelia." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async (): Promise<Faq[]> => {
      const res = await fetch('/api/faqs?active=true');
      if (!res.ok) throw new Error('Could not load faqs');
      return (await res.json()) as Faq[];
    },
  });

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <h1 className="font-display text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-3 text-muted-foreground">
          Can't find what you're looking for? Reach our team on the contact page.
        </p>
      </header>

      {isLoading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-12 space-y-10">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {cat}
              </h2>
              <Accordion type="single" collapsible className="rounded-lg border border-border px-4">
                {faqs
                  .filter((f) => f.category === cat)
                  .map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-2xl bg-secondary/50 p-8 text-center">
        <h3 className="font-display text-2xl">Still have questions?</h3>
        <p className="mt-2 text-muted-foreground">We're happy to help.</p>
        <Button asChild className="mt-4">
          <Link to="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
