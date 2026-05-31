import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

function AdminContent() {
  const qc = useQueryClient();

  // Our Story content
  const { data: story } = useQuery({
    queryKey: ["admin", "our_story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "our_story")
        .maybeSingle();
      if (error) throw error;
      return (data?.value as { heading?: string; body?: string }) ?? {};
    },
  });

  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (story) {
      setHeading(story.heading ?? "");
      setBody(story.body ?? "");
    }
  }, [story]);

  const saveStory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key: "our_story", value: { heading, body } }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_content", "our_story"] });
      toast.success("Story updated");
    },
    onError: () => toast.error("Could not save"),
  });

  // FAQs
  const { data: faqs = [] } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Faq[];
    },
  });

  const addFaq = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("faqs").insert({
        question: "New question",
        answer: "Answer here",
        category: "General",
        sort_order: faqs.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: () => toast.error("Could not add FAQ"),
  });

  const saveFaq = useMutation({
    mutationFn: async (f: Faq) => {
      const { error } = await supabase
        .from("faqs")
        .update({
          question: f.question,
          answer: f.answer,
          category: f.category,
          is_active: f.is_active,
        })
        .eq("id", f.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ saved");
    },
    onError: () => toast.error("Could not save FAQ"),
  });

  const deleteFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ removed");
    },
  });

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-3xl">Our Story</h1>
        <div className="mt-4 space-y-4 rounded-xl border border-border p-5">
          <div>
            <Label>Heading</Label>
            <Input value={heading} onChange={(e) => setHeading(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1"
            />
          </div>
          <Button onClick={() => saveStory.mutate()} disabled={saveStory.isPending}>
            Save story
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">FAQs</h2>
          <Button size="sm" onClick={() => addFaq.mutate()}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          {faqs.map((f) => (
            <FaqEditor key={f.id} faq={f} onSave={saveFaq.mutate} onDelete={deleteFaq.mutate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FaqEditor({
  faq,
  onSave,
  onDelete,
}: {
  faq: Faq;
  onSave: (f: Faq) => void;
  onDelete: (id: string) => void;
}) {
  const [local, setLocal] = useState(faq);
  useEffect(() => setLocal(faq), [faq]);

  return (
    <div className="space-y-3 rounded-xl border border-border p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <Label>Question</Label>
          <Input
            value={local.question}
            onChange={(e) => setLocal({ ...local, question: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={local.category}
            onChange={(e) => setLocal({ ...local, category: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          value={local.answer}
          onChange={(e) => setLocal({ ...local, answer: e.target.value })}
          rows={3}
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={local.is_active}
            onChange={(e) => setLocal({ ...local, is_active: e.target.checked })}
          />
          Active
        </label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(faq.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => onSave(local)}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
