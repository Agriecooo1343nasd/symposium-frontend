"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { patchStore, type CertificateTemplate } from "@/lib/store";
import { getCertificateTemplate } from "@/lib/platform-settings";
import { toast } from "sonner";

const DEFAULT_STYLE = {
  primaryColor: "#0f3d2e",
  accentColor: "#c9a227",
  showQr: true,
};

function withDefaults(t: CertificateTemplate): CertificateTemplate {
  return {
    ...t,
    style: { ...DEFAULT_STYLE, ...t.style },
    previewName: t.previewName ?? "Jean Uwimana",
    previewCategory: t.previewCategory ?? "International Delegate",
    previewTicketId: t.previewTicketId ?? "NAS26-PREVIEW-4821",
  };
}

export default function Page() {
  const [tpl, setTpl] = useState<CertificateTemplate>(() => withDefaults(getCertificateTemplate()));
  const style = useMemo(() => ({ ...DEFAULT_STYLE, ...tpl.style }), [tpl.style]);

  const save = () => {
    patchStore((s) => ({ ...s, certificateTemplate: tpl }));
    toast.success("Certificate template saved");
  };

  const readBg = (file: File) => {
    const r = new FileReader();
    r.onload = () => setTpl({ ...tpl, backgroundImageUrl: r.result as string });
    r.readAsDataURL(file);
  };

  const updateSig = (i: number, field: "name" | "title", value: string) => {
    const sigs = [...tpl.signatures];
    sigs[i] = { ...sigs[i], [field]: value };
    setTpl({ ...tpl, signatures: sigs });
  };

  const addSig = () => setTpl({ ...tpl, signatures: [...tpl.signatures, { name: "", title: "" }] });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Certificate designer</h1>
          <p className="text-muted-foreground">
            Changes appear instantly in the preview. Attendees see this after check-in (FR-8.2).
          </p>
        </div>
        <Button onClick={save} className="gradient-blue text-accent-foreground">
          Save template
        </Button>
      </div>

      <div className="grid xl:grid-cols-[minmax(280px,380px)_1fr] gap-8 items-start">
        <div className="rounded-2xl bg-card border p-5 space-y-5 xl:sticky xl:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div>
            <h2 className="font-serif font-bold text-sm mb-3">Certificate copy</h2>
            <div className="space-y-3">
              <div>
                <Label>Headline</Label>
                <Input value={tpl.headline} onChange={(e) => setTpl({ ...tpl, headline: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Event line</Label>
                <Input value={tpl.subheadline} onChange={(e) => setTpl({ ...tpl, subheadline: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Body text</Label>
                <Textarea value={tpl.bodyLine} onChange={(e) => setTpl({ ...tpl, bodyLine: e.target.value })} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>Footer (dates & venue)</Label>
                <Input value={tpl.footerLine} onChange={(e) => setTpl({ ...tpl, footerLine: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif font-bold text-sm mb-3">Preview delegate (sample)</h2>
            <div className="space-y-3">
              <div>
                <Label>Name on certificate</Label>
                <Input
                  value={tpl.previewName ?? ""}
                  onChange={(e) => setTpl({ ...tpl, previewName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Pass category</Label>
                <Input
                  value={tpl.previewCategory ?? ""}
                  onChange={(e) => setTpl({ ...tpl, previewCategory: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ticket / QR id</Label>
                <Input
                  value={tpl.previewTicketId ?? ""}
                  onChange={(e) => setTpl({ ...tpl, previewTicketId: e.target.value })}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif font-bold text-sm mb-3">Colors & layout</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Primary</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.primaryColor}
                    onChange={(e) => setTpl({ ...tpl, style: { ...style, primaryColor: e.target.value } })}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={style.primaryColor}
                    onChange={(e) => setTpl({ ...tpl, style: { ...style, primaryColor: e.target.value } })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label>Accent / gold</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.accentColor}
                    onChange={(e) => setTpl({ ...tpl, style: { ...style, accentColor: e.target.value } })}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={style.accentColor}
                    onChange={(e) => setTpl({ ...tpl, style: { ...style, accentColor: e.target.value } })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Label>Show verification QR</Label>
              <Switch
                checked={style.showQr}
                onCheckedChange={(showQr) => setTpl({ ...tpl, style: { ...style, showQr } })}
              />
            </div>
            <div className="mt-3">
              <Label>Background image</Label>
              <Input type="file" accept="image/*" className="mt-1" onChange={(e) => e.target.files?.[0] && readBg(e.target.files[0])} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-sm">Signatures</h2>
              <Button type="button" variant="outline" size="sm" onClick={addSig}>
                Add
              </Button>
            </div>
            {tpl.signatures.map((sig, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 mb-2 pb-2 border-b last:border-0">
                <Input placeholder="Name" value={sig.name} onChange={(e) => updateSig(i, "name", e.target.value)} />
                <Input placeholder="Title" value={sig.title} onChange={(e) => updateSig(i, "title", e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Live preview</p>
          <CertificatePreview
            template={tpl}
            delegateName={tpl.previewName}
            delegateCategory={tpl.previewCategory}
            ticketId={tpl.previewTicketId}
          />
        </div>
      </div>
    </div>
  );
}
