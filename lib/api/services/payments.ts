import { apiClient, unwrapApi } from "../client";
import { PAYMENT_INITIATE_TIMEOUT_MS } from "../constants";
import type { ApiResponse } from "../types";
import type {
  BankTransferProformaDto,
  ConfirmManualPaymentDto,
  DeskCashPaymentDto,
  InitiatePaymentDto,
  PaymentInitiateResponseDto,
  PaymentTransactionDto,
} from "../dto";

export const paymentsService = {
  initiate(dto: InitiatePaymentDto) {
    return apiClient
      .post<ApiResponse<PaymentInitiateResponseDto>>("/payments/initiate", dto, {
        timeout: PAYMENT_INITIATE_TIMEOUT_MS,
      })
      .then(unwrapApi);
  },
  bankTransferProforma(dto: BankTransferProformaDto) {
    return apiClient
      .post<ApiResponse<PaymentTransactionDto>>("/payments/bank-transfer/proforma", dto)
      .then(unwrapApi);
  },
  syncStatus(id: string) {
    return apiClient.post<ApiResponse<PaymentTransactionDto>>(`/payments/${id}/sync-status`).then(unwrapApi);
  },
  confirmManual(id: string, dto: ConfirmManualPaymentDto) {
    return apiClient
      .patch<ApiResponse<PaymentTransactionDto>>(`/payments/${id}/confirm-manual`, dto)
      .then(unwrapApi);
  },
  recordDeskCash(dto: DeskCashPaymentDto) {
    return apiClient.post<ApiResponse<PaymentTransactionDto>>("/payments/desk/cash", dto).then(unwrapApi);
  },
};
