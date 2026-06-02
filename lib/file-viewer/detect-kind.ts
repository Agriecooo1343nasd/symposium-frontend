export type FileViewerKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "text"
  | "csv"
  | "spreadsheet"
  | "word"
  | "presentation"
  | "unsupported";

const EXT_KIND: Record<string, FileViewerKind> = {
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  ico: "image",
  mp4: "video",
  mov: "video",
  webm: "video",
  ogv: "video",
  m4v: "video",
  avi: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  m4a: "audio",
  aac: "audio",
  pdf: "pdf",
  csv: "csv",
  tsv: "csv",
  xlsx: "spreadsheet",
  xls: "spreadsheet",
  ods: "spreadsheet",
  docx: "word",
  doc: "word",
  pptx: "presentation",
  ppt: "presentation",
  txt: "text",
  md: "text",
  markdown: "text",
  json: "text",
  xml: "text",
  log: "text",
  rtf: "text",
};

function kindFromMime(mime: string): FileViewerKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime === "text/csv" || mime === "text/tab-separated-values") return "csv";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "spreadsheet";
  if (mime.includes("wordprocessing") || mime === "application/msword") return "word";
  if (mime.includes("presentation") || mime === "application/vnd.ms-powerpoint") return "presentation";
  if (mime.startsWith("text/")) return "text";
  return null;
}

export function fileExtension(fileName: string): string {
  const base = fileName.split(/[?#]/)[0] ?? fileName;
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i + 1).toLowerCase() : "";
}

/** Classify a file for in-app read-only viewing. */
export function detectFileKind(fileName: string, src?: string): FileViewerKind {
  if (src?.startsWith("data:")) {
    const semi = src.indexOf(";");
    const mime = semi > 5 ? src.slice(5, semi).toLowerCase() : "";
    const fromMime = kindFromMime(mime);
    if (fromMime) return fromMime;
  }

  const ext = fileExtension(fileName);
  if (ext && EXT_KIND[ext]) return EXT_KIND[ext];

  if (src) {
    const urlExt = fileExtension(src);
    if (urlExt && EXT_KIND[urlExt]) return EXT_KIND[urlExt];
  }

  return "unsupported";
}

export function fileKindLabel(kind: FileViewerKind): string {
  switch (kind) {
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "pdf":
      return "PDF";
    case "text":
      return "Text";
    case "csv":
      return "CSV";
    case "spreadsheet":
      return "Spreadsheet";
    case "word":
      return "Word document";
    case "presentation":
      return "Presentation";
    default:
      return "File";
  }
}
