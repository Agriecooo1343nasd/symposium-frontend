"use client";

import { useRef } from "react";
import { Upload, FileText, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileViewLink } from "@/components/file-viewer";
import {
  useAddExhibitorMaterial,
  useExhibitorMaterials,
  useExhibitorProfile,
  useRemoveExhibitorMaterial,
  useUploadExhibitorMaterial,
} from "@/hooks/api/useExhibitor";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useExhibitorProfile();
  const { materials, isLoading } = useExhibitorMaterials();
  const uploadFile = useUploadExhibitorMaterial();
  const addMaterial = useAddExhibitorMaterial();
  const removeMaterial = useRemoveExhibitorMaterial();
  const quota = 5;

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (materials.length >= quota) {
      toast.error("Brochure quota reached");
      return;
    }
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      await addMaterial.mutateAsync({
        fileUrl: uploaded.url,
        fileName: file.name,
        fileType: uploaded.mimeType,
      });
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMaterial.mutateAsync(id);
      toast.info("Removed");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Brochures & downloads</h1>
          <p className="text-muted-foreground">
            {materials.length} brochure{materials.length !== 1 ? "s" : ""} uploaded
            {profile?.package?.name ? ` · ${profile.package.name} package` : ""}.
          </p>
        </div>
        <Button
          className="gradient-blue text-accent-foreground"
          disabled={materials.length >= quota || uploadFile.isPending || addMaterial.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {uploadFile.isPending || addMaterial.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          Upload brochure
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full gradient-blue"
          style={{ width: `${Math.min(100, (materials.length / Math.max(quota, 1)) * 100)}%` }}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <FileViewLink src={f.fileUrl} fileName={f.fileName} className="font-medium truncate block" />
                  <div className="text-xs text-muted-foreground">
                    {new Date(f.createdAt).toLocaleDateString()}
                    {f.fileType ? ` · ${f.fileType}` : ""}
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                disabled={removeMaterial.isPending}
                onClick={() => void handleRemove(f.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="text-sm text-muted-foreground">No brochures uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
