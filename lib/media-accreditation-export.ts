import type { MediaAccreditationDto } from "@/lib/api/dto";

function csvCell(value: string | null | undefined) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportMediaAccreditationsCsv(items: MediaAccreditationDto[]): string {
  const headers = [
    "ID",
    "Full name",
    "Email",
    "Phone",
    "Outlet",
    "Outlet type",
    "Job title",
    "Country",
    "Coverage",
    "Equipment",
    "Status",
    "Admin notes",
    "Press card URL",
    "Submitted",
  ];
  const rows = items.map((a) =>
    [
      a.id,
      a.fullName,
      a.email,
      a.phone,
      a.outletName,
      a.outletType,
      a.jobTitle,
      a.country,
      a.coverageType,
      a.equipmentNeeds,
      a.status,
      a.adminNotes,
      a.pressCardUrl,
      a.createdAt,
    ]
      .map(csvCell)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadMediaAccreditationsCsv(items: MediaAccreditationDto[], filename = "media-accreditations.csv") {
  const csv = exportMediaAccreditationsCsv(items);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
