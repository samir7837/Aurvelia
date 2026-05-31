import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}
interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

function AdminMessages() {
  const qc = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async (): Promise<Message[]> => {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch('/api/admin/messages', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load messages');
      return (await res.json()) as Message[];
    },
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: async (): Promise<Subscriber[]> => {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch('/api/admin/subscribers', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not load subscribers');
      return (await res.json()) as Subscriber[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem('aurvelia_token');
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Could not update message');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "messages"] });
      toast.success("Updated");
    },
    onError: () => toast.error("Could not update"),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Inbox</h1>

      <Tabs defaultValue="messages" className="mt-6">
        <TabsList>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers ({subscribers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4 pt-6">
          {messages.length === 0 && <p className="text-muted-foreground">No messages.</p>}
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.name} · {m.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === "resolved" ? "secondary" : "outline"} className="capitalize">
                    {m.status}
                  </Badge>
                  {m.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus.mutate({ id: m.id, status: "resolved" })}
                    >
                      Mark resolved
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                {m.message}
              </p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="subscribers" className="pt-6">
          <div className="rounded-xl border border-border">
            <ul className="divide-y divide-border">
              {subscribers.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>{s.email}</span>
                  <span className="text-muted-foreground">
                    {new Date(s.subscribed_at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
              {subscribers.length === 0 && (
                <li className="px-5 py-3 text-muted-foreground">No subscribers yet.</li>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
