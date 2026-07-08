"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { exhibitorsService, filesService, sponsorsService } from "@/lib/api/services";
import { getAccessToken } from "@/lib/api/client";
import type {
  CreateExhibitorApplicationDto,
  CreateExhibitorMaterialDto,
  CreateExhibitorPackageDto,
  CreateExhibitorStaffPassDto,
  ScanExhibitorLeadDto,
  UpdateExhibitorProfileDto,
  UpdateExhibitorPackageDto,
} from "@/lib/api/dto";
import { deriveExhibitorParticipation } from "@/lib/exhibitor/participation";
import { useSymposiumId } from "./useSymposium";

const enabled = () => typeof window !== "undefined" && Boolean(getAccessToken());

export function useExhibitorProfile() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.me,
    queryFn: () => exhibitorsService.getMyProfile(),
    enabled: enabled(),
    staleTime: 60_000,
    retry: false,
  });
  // A user can become a sponsor (via an approved sponsorship application) without
  // their pre-existing exhibitor record ever getting `sponsorId` back-filled by the
  // backend — GET /sponsors/me is the source of truth for "am I also a sponsor".
  const sponsorQuery = useQuery({
    queryKey: ["sponsors-me"],
    queryFn: () => sponsorsService.getMySponsorProfile(),
    enabled: enabled(),
    staleTime: 5 * 60_000,
    retry: false,
  });
  const profile = query.data ?? null;
  const linkedSponsor = sponsorQuery.data ?? null;
  const isSponsor = Boolean(profile?.sponsorId) || Boolean(linkedSponsor);
  return {
    ...query,
    profile,
    participation: deriveExhibitorParticipation(profile, Boolean(linkedSponsor)),
    isSponsor,
    sponsor: linkedSponsor,
    sponsorLoading: sponsorQuery.isLoading,
  };
}

export function useUpdateExhibitorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateExhibitorProfileDto) => exhibitorsService.updateMyProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useExhibitorMaterials() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.materials,
    queryFn: () => exhibitorsService.listMyMaterials(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, materials: query.data ?? [] };
}

export function useAddExhibitorMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorMaterialDto) => exhibitorsService.addMaterial(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.materials });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useRemoveExhibitorMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exhibitorsService.removeMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.materials });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useExhibitorStaffPasses() {
  const query = useQuery({
    queryKey: queryKeys.exhibitors.staffPasses,
    queryFn: () => exhibitorsService.listStaffPasses(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, passes: query.data ?? [] };
}

export function useCreateExhibitorStaffPass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorStaffPassDto) => exhibitorsService.createStaffPass(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.staffPasses });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useRemoveExhibitorStaffPass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exhibitorsService.removeStaffPass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.staffPasses });
      queryClient.invalidateQueries({ queryKey: queryKeys.exhibitors.me });
    },
  });
}

export function useScanExhibitorLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ScanExhibitorLeadDto) => exhibitorsService.scanLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitors-me-leads"] });
    },
  });
}

export function useUploadExhibitorMaterial() {
  return useMutation({
    mutationFn: (file: File) => filesService.upload(file, "exhibitor_material"),
  });
}

export function useLinkedSponsor(sponsorId: string | null | undefined) {
  const symposiumId = useSymposiumId();
  const query = useQuery({
    queryKey: queryKeys.sponsors.bySymposium(symposiumId ?? ""),
    queryFn: () => sponsorsService.listBySymposium(symposiumId!),
    enabled: enabled() && Boolean(symposiumId) && Boolean(sponsorId),
    staleTime: 5 * 60_000,
  });
  const sponsor = query.data?.find((s) => s.id === sponsorId) ?? null;
  return { ...query, sponsor };
}

// New hooks for sponsorship applications (FR-5.1)
export function useSponsorshipTierPricing(symposiumId: string | undefined) {
  const query = useQuery({
    queryKey: ["sponsorship-tier-pricing", symposiumId],
    queryFn: () => sponsorsService.getSponsorshipTierPricing(symposiumId!),
    enabled: Boolean(symposiumId),
    staleTime: 10 * 60_000,
  });
  return { ...query, pricing: query.data ?? [] };
}

export function useCreateSponsorshipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      symposiumId?: string;
      organizationName: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      desiredTier: "platinum" | "gold" | "silver";
      message?: string;
      wantsExhibitorBooth: boolean;
      preferredBoothId?: string;
      staffCount?: number;
    }) => sponsorsService.createSponsorshipApplication(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications"] });
    },
  });
}

export function useMyExhibitorApplications() {
  const query = useQuery({
    queryKey: ["exhibitor-applications-me"],
    queryFn: () => exhibitorsService.listMyApplications(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, applications: query.data ?? [] };
}

export function useListExhibitorApplications(symposiumId?: string, status?: string) {
  const query = useQuery({
    queryKey: ["exhibitor-applications-admin", symposiumId, status],
    queryFn: () => exhibitorsService.listApplicationsAdmin({ symposiumId, status, limit: 100 }),
    enabled: enabled(),
    staleTime: 30_000,
  });
  const applications = query.data?.items ?? [];
  return { ...query, applications, data: applications };
}

export function useExhibitorApplicationStats(symposiumId?: string) {
  const query = useQuery({
    queryKey: ["exhibitor-applications-stats", symposiumId],
    queryFn: () => exhibitorsService.getApplicationStats(symposiumId),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, stats: query.data ?? null };
}

export function useApproveExhibitorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: string;
      dto?: { packageId?: string; boothId?: string; boothNumber?: string; adminNotes?: string };
    }) => exhibitorsService.approveApplication(params.id, params.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-stats"] });
    },
  });
}

export function useRejectExhibitorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; adminNotes?: string }) =>
      exhibitorsService.rejectApplication(params.id, { adminNotes: params.adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-stats"] });
    },
  });
}

export function useMarkExhibitorInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; notes?: string }) =>
      exhibitorsService.markInvoicePaid(params.id, { notes: params.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-stats"] });
    },
  });
}

export function useCreateExhibitorApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorApplicationDto) => exhibitorsService.createApplication(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-applications-me"] });
    },
  });
}

export function useMySponsorProfile() {
  const query = useQuery({
    queryKey: ["sponsors-me"],
    queryFn: () => sponsorsService.getMySponsorProfile(),
    enabled: enabled(),
    staleTime: 5 * 60_000,
  });
  return { ...query, sponsor: query.data ?? null };
}

export function useUpdateMySponsorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { logoUrl?: string; websiteUrl?: string; description?: string }) =>
      sponsorsService.updateMySponsorProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors-me"] });
    },
  });
}

export function useMySponsorInvoice() {
  const query = useQuery({
    queryKey: ["sponsors-me-invoice"],
    queryFn: () => sponsorsService.getMySponsorInvoice(),
    enabled: enabled(),
    staleTime: 5 * 60_000,
  });
  return { ...query, invoice: query.data ?? null };
}

// New hook for exhibitor leads
export function useMyExhibitorLeads() {
  const query = useQuery({
    queryKey: ["exhibitors-me-leads"],
    queryFn: () => exhibitorsService.listMyLeads(),
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, leads: query.data ?? [] };
}

// Admin sponsorship application management hooks
export function useListSponsorshipApplications(symposiumId?: string, status?: string) {
  const query = useQuery({
    queryKey: ["sponsorship-applications-admin", symposiumId, status],
    queryFn: () => sponsorsService.listSponsorshipApplications({ symposiumId, status }),
    enabled: enabled(),
    staleTime: 30_000,
  });
  const applications = query.data?.items ?? [];
  return { ...query, applications, data: applications };
}

export function useSponsorshipApplicationStats(symposiumId?: string) {
  const query = useQuery({
    queryKey: ["sponsorship-applications-stats", symposiumId],
    queryFn: () => sponsorsService.getSponsorshipApplicationStats(symposiumId),
    enabled: enabled(),
    staleTime: 60_000,
  });
  return { ...query, stats: query.data ?? null };
}

export function useSponsorshipApplication(id: string) {
  const query = useQuery({
    queryKey: ["sponsorship-application", id],
    queryFn: () => sponsorsService.getSponsorshipApplication(id),
    enabled: enabled() && Boolean(id),
    staleTime: 30_000,
  });
  return { ...query, application: query.data ?? null };
}

export function useApproveSponsorshipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; dto?: Record<string, unknown> }) =>
      sponsorsService.approveSponsorshipApplication(params.id, params.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-stats"] });
    },
  });
}

export function useRejectSponsorshipApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; adminNotes?: string }) =>
      sponsorsService.rejectSponsorshipApplication(params.id, { adminNotes: params.adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-stats"] });
    },
  });
}

export function useSponsorshipApplicationInvoice(id: string) {
  const query = useQuery({
    queryKey: ["sponsorship-application-invoice", id],
    queryFn: () => sponsorsService.getSponsorshipApplicationInvoice(id),
    enabled: enabled() && Boolean(id),
    staleTime: 30_000,
  });
  return { ...query, invoice: query.data ?? null };
}

export function useMarkSponsorshipInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; notes?: string }) =>
      sponsorsService.markSponsorshipInvoicePaid(params.id, { notes: params.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-admin"] });
      queryClient.invalidateQueries({ queryKey: ["sponsorship-applications-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sponsorship-invoice-rows"] });
    },
  });
}

export function usePublicExhibitorPackages(symposiumId: string | undefined) {
  const query = useQuery({
    queryKey: ["exhibitor-packages-public", symposiumId],
    queryFn: () => exhibitorsService.listPackages(symposiumId!),
    enabled: Boolean(symposiumId),
    staleTime: 10 * 60_000,
  });
  return { ...query, packages: query.data ?? [] };
}

export function useAdminExhibitorPackages(symposiumId: string | undefined) {
  const query = useQuery({
    queryKey: ["exhibitor-packages-admin", symposiumId],
    queryFn: () => exhibitorsService.listPackagesAdmin(symposiumId!),
    enabled: enabled() && Boolean(symposiumId),
    staleTime: 30_000,
  });
  return { ...query, packages: query.data ?? [] };
}

export function useCreateExhibitorPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExhibitorPackageDto) => exhibitorsService.createPackage(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-public"] });
    },
  });
}

export function useUpdateExhibitorPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; dto: UpdateExhibitorPackageDto }) =>
      exhibitorsService.updatePackage(params.id, params.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-public"] });
    },
  });
}

export function useRemoveExhibitorPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exhibitorsService.removePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-admin"] });
      queryClient.invalidateQueries({ queryKey: ["exhibitor-packages-public"] });
    },
  });
}

export type SponsorshipInvoiceRow = {
  application: import("@/lib/api/dto").SponsorshipApplicationDto;
  invoice: import("@/lib/api/dto").SponsorshipInvoiceDto;
};

export function useAdminSponsorshipInvoiceRows(symposiumId?: string) {
  const resolvedSymposiumId = useSymposiumId();
  const id = symposiumId ?? resolvedSymposiumId ?? undefined;
  const query = useQuery({
    queryKey: ["sponsorship-invoice-rows", id],
    queryFn: async (): Promise<SponsorshipInvoiceRow[]> => {
      const [approved, invoiced] = await Promise.all([
        sponsorsService.listSponsorshipApplications({ symposiumId: id, status: "approved", limit: 100 }),
        sponsorsService.listSponsorshipApplications({ symposiumId: id, status: "invoiced", limit: 100 }),
      ]);
      const byId = new Map<string, import("@/lib/api/dto").SponsorshipApplicationDto>();
      for (const app of [...approved.items, ...invoiced.items]) {
        byId.set(app.id, app);
      }
      const rows = await Promise.all(
        [...byId.values()].map(async (application) => {
          const invoice = await sponsorsService.getSponsorshipApplicationInvoice(application.id);
          return invoice ? { application, invoice } : null;
        }),
      );
      return rows.filter((row): row is SponsorshipInvoiceRow => row !== null);
    },
    enabled: enabled(),
    staleTime: 30_000,
  });
  return { ...query, rows: query.data ?? [] };
}

export function useAddExhibitorBoothToSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { sponsorId: string; boothNumber: string; packageId?: string }) =>
      sponsorsService.addExhibitorBoothToSponsor(params.sponsorId, {
        boothNumber: params.boothNumber,
        packageId: params.packageId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
  });
}
