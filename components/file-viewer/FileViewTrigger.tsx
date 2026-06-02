"use client";

import { Eye, FileText } from "lucide-react";
import { useFileViewerOptional } from "./FileViewerProvider";
import { cn } from "@/lib/utils";
import type { FileViewerPayload } from "@/lib/file-viewer";

type BaseProps = FileViewerPayload & {
  className?: string;
  disabled?: boolean;
};

/** Text link that opens the in-app read-only file viewer. */
export function FileViewLink({
  src,
  fileName,
  children,
  className,
  disabled,
  showIcon = true,
}: BaseProps & {
  children?: React.ReactNode;
  showIcon?: boolean;
}) {
  const viewer = useFileViewerOptional();

  if (!src || disabled) {
    return <span className={cn("text-muted-foreground text-sm", className)}>{children ?? fileName ?? "—"}</span>;
  }

  const label = children ?? fileName;

  return (
    <button
      type="button"
      onClick={() => viewer?.openFile({ src, fileName: fileName || "document" })}
      className={cn(
        "inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline text-left max-w-full",
        !viewer && "opacity-60 cursor-not-allowed",
        className,
      )}
      disabled={!viewer}
    >
      {showIcon && <FileText className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{label}</span>
      {showIcon && <Eye className="h-3 w-3 shrink-0 opacity-70" />}
    </button>
  );
}

/** Compact button variant. */
export function FileViewButton({
  src,
  fileName,
  className,
  disabled,
  label = "View",
  variant = "outline",
}: BaseProps & {
  label?: string;
  variant?: "outline" | "ghost" | "default";
}) {
  const viewer = useFileViewerOptional();

  return (
    <button
      type="button"
      disabled={!src || disabled || !viewer}
      onClick={() => viewer?.openFile({ src, fileName: fileName || "document" })}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors h-8 px-3",
        variant === "outline" && "border border-input bg-background hover:bg-accent/10",
        variant === "ghost" && "hover:bg-accent/10",
        variant === "default" && "bg-primary text-primary-foreground hover:opacity-90",
        className,
      )}
    >
      <Eye className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
