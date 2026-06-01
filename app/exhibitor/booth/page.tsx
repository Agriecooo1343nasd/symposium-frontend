"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EXHIBITORS } from "@/lib/mock-data";
import { toast } from "sonner";


export default function Page() {
  const me = EXHIBITORS[0];
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Booth profile</h1>
      <p className="text-muted-foreground mb-6">This is what attendees see in the exhibitor directory and signage.</p>

      <form onSubmit={(e) => { e.preventDefault(); toast.success("Booth profile saved"); }} className="rounded-2xl bg-card border border-border p-6 space-y-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Company name</Label><Input defaultValue={me.name} className="mt-1" /></div>
          <div><Label>Booth number</Label><Input defaultValue={me.booth} className="mt-1" /></div>
          <div><Label>Category</Label><Input defaultValue={me.category} className="mt-1" /></div>
          <div><Label>Contact email</Label><Input type="email" defaultValue={me.contact} className="mt-1" /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={4} defaultValue={me.description} className="mt-1" /></div>
        <div><Label>Website</Label><Input placeholder="https://" className="mt-1" /></div>
        <Button type="submit" className="gradient-blue text-accent-foreground">Save changes</Button>
      </form>
    </div>
  );
}
