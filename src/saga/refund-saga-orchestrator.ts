export type RefundSagaState =
  | 'INITIATED'
  | 'FRAUD_AUDITED'
  | 'VENDOR_BALANCE_CLAWED_BACK'
  | 'PSP_REFUND_SETTLED'
  | 'COMPENSATING_VENDOR_CREDIT'
  | 'SAGA_ROLLED_BACK'
  | 'DLQ_QUARANTINED';

export interface RefundSagaSnapshot {
  readonly sagaId: string;
  readonly captureId: string;
  readonly connectedVendorId: string;
  readonly refundAmountMinor: bigint;
  readonly currentState: RefundSagaState;
  readonly requiresVendorCompensation: boolean;
}

/**
 * Deterministic Refund & Vendor Reversal Saga State Machine (ADR 0002)
 * Coordinates multi-service state transitions and compensating rollbacks.
 */
export class RefundSagaOrchestrator {
  public transitionOnAcquirerOutcome(
    snapshot: RefundSagaSnapshot,
    outcome: 'SETTLED' | 'TERMINAL_BANK_REJECT' | 'AMBIGUOUS_TIMEOUT'
  ): RefundSagaSnapshot {
    if (snapshot.currentState !== 'VENDOR_BALANCE_CLAWED_BACK') {
      throw new Error(
        `Invalid saga state transition from "${snapshot.currentState}" on acquirer outcome.`
      );
    }

    if (outcome === 'SETTLED') {
      return {
        ...snapshot,
        currentState: 'PSP_REFUND_SETTLED',
        requiresVendorCompensation: false
      };
    }

    if (outcome === 'TERMINAL_BANK_REJECT') {
      return {
        ...snapshot,
        currentState: 'COMPENSATING_VENDOR_CREDIT',
        requiresVendorCompensation: true
      };
    }

    return {
      ...snapshot,
      currentState: 'DLQ_QUARANTINED',
      requiresVendorCompensation: false
    };
  }
}
