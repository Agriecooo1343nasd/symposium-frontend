"use client";

import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";


export default function Page() {
  const store = useStore();
  const grouped = {
    pending: store.speakerApplications.filter((a) => a.status === "pending"),
    approved: store.speakerApplications.filter((a) => a.status === "approved"),
    rejected: store.speakerApplications.filter((a) => a.status === "rejected"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Speaker applications</h1>
        <p className="text-muted-foreground">
          Review abstracts and uploaded materials before approving speakers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(["pending", "approved", "rejected"] as const).map((status) => (
          <div key={status} className="rounded-2xl bg-card border p-4 text-center">
            <div className="font-serif text-2xl font-bold">{grouped[status].length}</div>
            <div className="text-xs uppercase text-muted-foreground capitalize">{status}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Applicant</th>
              <th className="text-left px-4 py-3">Presentation</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Abstract / upload</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.speakerApplications.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.photoUrl && <img src={a.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover border" />}
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="font-medium line-clamp-2">{a.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.summary}</div>
                </td>
                <td className="px-4 py-3 text-xs">{a.presentationType}</td>
                <td className="px-4 py-3">
                  {a.documentName ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <FileText className="h-3.5 w-3.5 text-accent" />
                      <span className="font-mono truncate max-w-[120px]">{a.documentName}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      a.status === "approved"
                        ? "bg-green/15 text-green"
                        : a.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/abstracts/${a.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View application
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.speakerApplications.length === 0 && (
          <p className="p-8 text-sm text-muted-foreground text-center">No speaker applications yet.</p>
        )}
      </div>

      {store.speakerAbstracts.length > 0 && (
        <div>
          <h2 className="font-serif font-bold text-lg mb-3">Legacy abstract submissions</h2>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Track</th><th className="text-left px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {store.speakerAbstracts.map((ab) => (
                  <tr key={ab.id} className="border-t">
                    <td className="px-4 py-3">{ab.title}</td>
                    <td className="px-4 py-3 text-xs">{ab.track}</td>
                    <td className="px-4 py-3 text-xs capitalize">{ab.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
