"use client";

import { Download, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { getCertificateTemplate } from "@/lib/platform-settings";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { useGenerateCertificate, useMyCertificates } from "@/hooks/api/useDashboard";
import { primaryRegistration, registrationCategoryLabel } from "@/lib/api/mappers/registration-helpers";
import { useCurrentUser } from "@/hooks/api/useAuthSession";
import { userDisplayName } from "@/lib/api/mappers/user";
import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

const PENDING_PREFIX = "pending://";

export default function DashboardCertificatePage() {
  const tpl = getCertificateTemplate();
  const { session } = useAuth();
  const { data: user } = useCurrentUser();
  const { registrations } = useMyRegistrations();
  const reg = primaryRegistration(registrations);
  const { data: certificates = [], isLoading, isError, error } = useMyCertificates();
  const generate = useGenerateCertificate();

  const name = user ? userDisplayName(user) : session?.name ?? "Delegate";
  const category = registrationCategoryLabel(reg);
  const cert = certificates.find((c) => c.registrationId === reg?.id) ?? certificates[0];
  const fileReady = cert?.fileUrl && !cert.fileUrl.startsWith(PENDING_PREFIX);

  const handleGenerate = async () => {
    if (!reg?.id) return;
    try {
      await generate.mutateAsync(reg.id);
      toast.success("Certificate generation started — refresh in a moment if the PDF is still processing.");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Certificate of attendance</h1>
      <p className="text-muted-foreground mb-6">
        Available after check-in at the venue. Generate or download your certificate once eligible.
      </p>

      {isError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-6">
          Certificate access may require additional permissions on your account. If you have checked in, contact the
          secretariat. ({apiErrorMessage(error)})
        </div>
      )}

      <CertificatePreview
        template={tpl}
        delegateName={name}
        delegateCategory={category}
        ticketId={reg?.id?.slice(0, 8).toUpperCase()}
      />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isLoading ? (
          <Button disabled variant="outline">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading…
          </Button>
        ) : fileReady ? (
          <>
            <Button asChild className="gradient-blue text-accent-foreground">
              <a href={cert!.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" /> Download certificate
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print preview
            </Button>
          </>
        ) : reg?.status === "active" ? (
          <Button
            className="gradient-blue text-accent-foreground"
            onClick={handleGenerate}
            disabled={generate.isPending}
          >
            {generate.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating…
              </>
            ) : (
              "Generate certificate"
            )}
          </Button>
        ) : (
          <Button disabled variant="outline">
            <Lock className="h-4 w-4 mr-1" /> Check in at the desk first
          </Button>
        )}
      </div>
      {cert?.fileUrl?.startsWith(PENDING_PREFIX) && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Your certificate PDF is being prepared — check back shortly.
        </p>
      )}
    </div>
  );
}
