"use client";

import { useState } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileViewLink } from "@/components/file-viewer";
import {
  useCreateSpeakerMaterial,
  useSpeakerSessionMaterials,
  useUpdateSpeakerMaterialEquipment,
  useUploadSpeakerDeck,
} from "@/hooks/api/useSpeaker";
import { apiErrorMessage } from "@/lib/api/client";
import type { SpeakerMaterialDto } from "@/lib/api/dto";
import { toast } from "sonner";

type AvForm = {
  presentationTool: "venue" | "own";
  microphone: string;
  needsInternet: boolean;
  includesVideo: boolean;
  specialEquipment: string;
};

function avFromMaterial(material: SpeakerMaterialDto | undefined): AvForm {
  const eq = material?.equipmentRequirements ?? {};
  return {
    presentationTool: (eq.presentationTool as AvForm["presentationTool"]) ?? "venue",
    microphone: (eq.microphone as string) ?? "lavalier",
    needsInternet: Boolean(eq.needsInternet ?? true),
    includesVideo: Boolean(eq.includesVideo ?? false),
    specialEquipment: (eq.specialEquipment as string) ?? "",
  };
}

type Props = {
  sessionId: string;
  sessionTitle: string;
  showEquipment?: boolean;
};

export function SpeakerSessionMaterialsPanel({ sessionId, sessionTitle, showEquipment }: Props) {
  const { materials, isLoading } = useSpeakerSessionMaterials(sessionId);
  const createMaterial = useCreateSpeakerMaterial(sessionId);
  const updateEquipment = useUpdateSpeakerMaterialEquipment();
  const uploadDeck = useUploadSpeakerDeck();
  const [uploading, setUploading] = useState(false);
  const primary = materials[0];
  const [avForm, setAvForm] = useState<AvForm>(() => avFromMaterial(primary));

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const uploaded = await uploadDeck.mutateAsync(file);
      await createMaterial.mutateAsync({ fileUrl: uploaded.url });
      toast.success("Presentation uploaded for this session");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const saveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primary) {
      toast.error("Upload a presentation file first");
      return;
    }
    try {
      await updateEquipment.mutateAsync({
        id: primary.id,
        dto: { equipmentRequirements: { ...avForm } },
      });
      toast.success("AV requirements saved");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div>
        <h3 className="font-serif font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" /> Session materials
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{sessionTitle}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
              <FileViewLink src={m.fileUrl} fileName="Presentation" className="font-medium truncate" />
              <span className="text-[10px] text-muted-foreground ml-auto">
                {new Date(m.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="text-xs"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        ) : (
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {showEquipment && (
        <form onSubmit={saveEquipment} className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-semibold">AV requirements</h4>
          <div>
            <Label>Presentation tool</Label>
            <Select
              value={avForm.presentationTool}
              onValueChange={(v) => setAvForm({ ...avForm, presentationTool: v as AvForm["presentationTool"] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venue">Venue laptop</SelectItem>
                <SelectItem value="own">My own laptop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Microphone</Label>
            <Select
              value={avForm.microphone}
              onValueChange={(v) => setAvForm({ ...avForm, microphone: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lavalier">Lavalier</SelectItem>
                <SelectItem value="handheld">Handheld</SelectItem>
                <SelectItem value="headset">Headset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Needs internet</Label>
            <Switch
              checked={avForm.needsInternet}
              onCheckedChange={(c) => setAvForm({ ...avForm, needsInternet: c })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Includes video / demo</Label>
            <Switch
              checked={avForm.includesVideo}
              onCheckedChange={(c) => setAvForm({ ...avForm, includesVideo: c })}
            />
          </div>
          <div>
            <Label>Special equipment</Label>
            <Textarea
              rows={2}
              className="mt-1"
              value={avForm.specialEquipment}
              onChange={(e) => setAvForm({ ...avForm, specialEquipment: e.target.value })}
            />
          </div>
          <Button type="submit" size="sm" disabled={updateEquipment.isPending}>
            Save AV requirements
          </Button>
        </form>
      )}
    </div>
  );
}
