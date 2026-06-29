"use client";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EVENT } from "@/lib/mock-data";
import { useSubmitContact } from "@/hooks/api/usePublicData";
import { apiErrorMessage } from "@/lib/api/client";

const SUBJECTS: Record<string, string> = {
  general: "General enquiry",
  sponsorship: "Sponsorship team",
  press: "Press & media",
  registration: "Registration support",
};

export default function Contact() {
  const submit = useSubmitContact();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reach, setReach] = useState("general");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit.mutate(
      { name, email, subject: SUBJECTS[reach] ?? "General enquiry", message },
      {
        onSuccess: () => {
          toast.success("Message sent — we'll be in touch within 48 hours.");
          setName("");
          setEmail("");
          setReach("general");
          setMessage("");
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-16">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Let&apos;s <span className="text-gradient-light">talk.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-[1fr_1.4fr] gap-12">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold">Reach the secretariat</h2>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@nas2026.rw" },
              { icon: Phone, label: "Phone", value: "+250 788 000 000" },
              { icon: MapPin, label: "Venue", value: EVENT.venue },
            ].map((c) => (
              <div key={c.label} className="flex gap-3 items-start">
                <div className="h-10 w-10 rounded-xl gradient-navy text-white flex items-center justify-center flex-shrink-0">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</div>
                  <div className="text-sm font-medium text-foreground mt-0.5">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>I&apos;d like to reach</Label>
            <Select value={reach} onValueChange={setReach}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General enquiry</SelectItem>
                <SelectItem value="sponsorship">Sponsorship team</SelectItem>
                <SelectItem value="press">Press &amp; media</SelectItem>
                <SelectItem value="registration">Registration support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="How can we help?" className="mt-1" />
          </div>
          <Button type="submit" disabled={submit.isPending} className="w-full gradient-blue text-accent-foreground">
            {submit.isPending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </>
  );
}
