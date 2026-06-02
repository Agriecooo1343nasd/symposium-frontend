export const FONT_FAMILIES = [
  { id: "default", label: "Default", css: "" },
  { id: "inter", label: "Inter", css: "Inter, sans-serif" },
  { id: "georgia", label: "Georgia", css: "Georgia, serif" },
  { id: "times", label: "Times New Roman", css: '"Times New Roman", Times, serif' },
  { id: "arial", label: "Arial", css: "Arial, sans-serif" },
  { id: "courier", label: "Courier New", css: '"Courier New", monospace' },
] as const;

export const FONT_SIZES = [
  { id: "12", label: "12 px", css: "12px" },
  { id: "14", label: "14 px", css: "14px" },
  { id: "16", label: "16 px", css: "16px" },
  { id: "18", label: "18 px", css: "18px" },
  { id: "20", label: "20 px", css: "20px" },
  { id: "24", label: "24 px", css: "24px" },
  { id: "28", label: "28 px", css: "28px" },
  { id: "32", label: "32 px", css: "32px" },
] as const;

export const BLOCK_STYLES = [
  { id: "p", label: "Normal" },
  { id: "1", label: "Heading 1" },
  { id: "2", label: "Heading 2" },
  { id: "3", label: "Heading 3" },
] as const;

export const TEXT_COLORS = [
  "#0f172a",
  "#1e3a5f",
  "#2563eb",
  "#059669",
  "#ca8a04",
  "#dc2626",
  "#7c3aed",
  "#64748b",
];

export const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecdd3", "#e9d5ff"];

/** Radix select content must sit above the notes panel (z-55) and pen (z-60). */
export const NOTES_SELECT_CONTENT_CLASS = "z-[250]";
