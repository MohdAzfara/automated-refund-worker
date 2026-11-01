/**
 * Deterministic Error Taxonomy for Asynchronous Refund & Reversal Pipelines
 * Distinguishes terminal invariant violations from retryable gateway faults.
 */
export enum RefundErrorCode {
  CUMULATIVE_REFUND_CAP_EXCEEDED = 'ERR_REFUND_CUMULATIVE_CAP_EXCEEDED',
  IDEMPOTENCY_KEY_PAYLOAD_CONFLICT = 'ERR_REFUND_IDEMPOTENCY_KEY_PAYLOAD_CONFLICT',
  FRAUD_VELOCITY_HARD_REJECT = 'ERR_REFUND_FRAUD_VELOCITY_HARD_REJECT',
  VENDOR_REVERSAL_INSUFFICIENT_FUNDS = 'ERR_REFUND_VENDOR_REVERSAL_INSUFFICIENT_FUNDS',
  ACQUIRER_GATEWAY_TRANSIENT_TIMEOUT = 'ERR_REFUND_ACQUIRER_GATEWAY_TRANSIENT_TIMEOUT',
  SAGA_COMPENSATION_REQUIRED = 'ERR_REFUND_SAGA_COMPENSATION_REQUIRED',
  DLQ_QUARANTINE_ESCALATED = 'ERR_REFUND_DLQ_QUARANTINE_ESCALATED'
}

export class RefundDomainError extends Error {
  public readonly code: RefundErrorCode;
  public readonly retryable: boolean;
  public readonly occurredAtIso: string;

  constructor(code: RefundErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'RefundDomainError';
    this.code = code;
    this.retryable = retryable;
    this.occurredAtIso = new Date().toISOString();
    Object.setPrototypeOf(this, RefundDomainError.prototype);
  }
}
