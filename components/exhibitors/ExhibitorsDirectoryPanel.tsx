"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminExhibitors } from "@/hooks/api/useAdmin";
import type { ExhibitorAdminDto } from "@/lib/api/dto";
import { ListToolbar } from "@/components/exhibitors/ListToolbar";

type SortKey = "boothNumber" | "staffPassQuota" | "createdAt";

function packageName(exhibitor: ExhibitorAdminDto): string | null {
  const pkg = exhibitor.package;
  if (!pkg || typeof pkg !== "object") return null;
  const name = (pkg as { name?: string }).name;
  return name?.trim() || null;
}

function ExhibitorApiCard({ exhibitor }: { exhibitor: ExhibitorAdminDto }) {
  const name = exhibitor.companyName?.trim() || "Unnamed exhibitor";
  const pkg = packageName(exhibitor);

  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover-lift">
      <div className="flex items-start justify-between mb-2">
        <div className="h-10 w-10 rounded-lg gradient-navy text-white flex items-center justify-center font-serif font-bold shrink-0">
          {name[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex flex-col items-end gap-1">
          {exhibitor.sponsorId ? (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Sponsor linked
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary capitalize">
              Exhibitor
            </span>
          )}
        </div>
      </div>
      <div className="font-serif font-bold">{name}</div>
      {pkg && <div className="text-xs text-muted-foreground mt-1">{pkg}</div>}
      <div className="text-xs text-muted-foreground mt-2">
        Booth{" "}
        <span className="font-mono font-medium text-foreground">{exhibitor.boothNumber ?? "—"}</span>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
        <span>{exhibitor.staffPassQuota} staff passes</span>
        <span>Added {new Date(exhibitor.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

type Props = {
  onTotalChange?: (total: number) => void;
};

export function ExhibitorsDirectoryPanel({ onTotalChange }: Props) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, sortKey, sortDir, pageSize]);

  const apiSort = useMemo(
    () => `${sortKey}:${sortDir.toUpperCase()}`,
    [sortKey, sortDir],
  );

  const { exhibitors, meta, isLoading, isError, isFetching } = useAdminExhibitors({
    page,
    limit: pageSize,
    search: debouncedQ || undefined,
    sort: apiSort,
  });

  const total = meta?.total ?? exhibitors.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  return (
    <div className="space-y-4">
      <ListToolbar
        query={q}
        onQueryChange={setQ}
        searchPlaceholder="Search by company name or booth…"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortKeyChange={(k) => setSortKey(k as SortKey)}
        onSortDirChange={setSortDir}
        sortOptions={[
          { value: "createdAt", label: "Date added" },
          { value: "boothNumber", label: "Booth" },
          { value: "staffPassQuota", label: "Staff passes" },
        ]}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {isError && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          Could not load exhibitors. Check your permissions and try again.
        </p>
      )}

      {isLoading && exhibitors.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading exhibitors…
        </div>
      ) : exhibitors.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground text-sm">
          {debouncedQ ? "No exhibitors match your search." : "No exhibitor booth profiles yet."}
        </p>
      ) : (
        <div className="relative">
          {isFetching && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 bg-background/40 pointer-events-none">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibitors.map((e) => (
              <ExhibitorApiCard key={e.id} exhibitor={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
