"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { filesService, paymentsService, registrationsService } from "@/lib/api/services";
import { mapRegistrations } from "@/lib/api/mappers/registration";
import { getAccessToken } from "@/lib/api/client";
import type {
  BankTransferProformaDto,
  CreateGroupRegistrationDto,
  CreateRegistrationDto,
  InitiatePaymentDto,
  UpdateRegistrationCategoryDto,
} from "@/lib/api/dto";

export function useMyRegistrations() {
  const query = useQuery({
    queryKey: queryKeys.registrations.mine,
    queryFn: () => registrationsService.listMine(),
    enabled: typeof window !== "undefined" && Boolean(getAccessToken()),
    staleTime: 60_000,
  });
  return {
    ...query,
    registrations: mapRegistrations(query.data ?? []),
  };
}

export function useCreateRegistration() {
  return useMutation({
    mutationFn: (dto: CreateRegistrationDto) => registrationsService.create(dto),
  });
}

export function useSelectCategory() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRegistrationCategoryDto }) =>
      registrationsService.updateCategory(id, dto),
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: InitiatePaymentDto) => paymentsService.initiate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.mine });
    },
  });
}

export function useBankTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BankTransferProformaDto) => paymentsService.bankTransferProforma(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.mine });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGroupRegistrationDto) => registrationsService.createGroup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.mine });
    },
  });
}

export function useUploadVerificationDoc() {
  return useMutation({
    mutationFn: (file: File) => filesService.upload(file, "verification_doc"),
  });
}
