export interface CaptureRefundLedgerState {
  readonly captureId: string;
  readonly originalCapturedMinor: bigint;
  readonly settledRefundedMinor: bigint;
  readonly inFlightReservedMinor: bigint;
}

export interface RefundReservationDecision {
  readonly allowed: boolean;
  readonly remainingRefundableMinor: bigint;
  readonly updatedInFlightMinor: bigint;
  readonly rejectionReason?: string;
}

/**
 * Cumulative Partial Refund Cap Guard (ADR 0001)
 * Mathematically enforces: settled + inFlight + requested <= originalCaptured
 */
export class CumulativeRefundCapGuard {
  public evaluateAndReserve(
    state: CaptureRefundLedgerState,
    requestedRefundMinor: bigint
  ): RefundReservationDecision {
    if (requestedRefundMinor <= 0n) {
      return {
        allowed: false,
        remainingRefundableMinor:
          state.originalCapturedMinor - (state.settledRefundedMinor + state.inFlightReservedMinor),
        updatedInFlightMinor: state.inFlightReservedMinor,
        rejectionReason: 'Requested refund amount must be a positive BigInt minor unit.'
      };
    }

    const committedPlusInFlight = state.settledRefundedMinor + state.inFlightReservedMinor;
    const projectedTotal = committedPlusInFlight + requestedRefundMinor;

    if (projectedTotal > state.originalCapturedMinor) {
      return {
        allowed: false,
        remainingRefundableMinor: state.originalCapturedMinor - committedPlusInFlight,
        updatedInFlightMinor: state.inFlightReservedMinor,
        rejectionReason: `Cumulative refund cap exceeded: projected ${projectedTotal.toString()} > captured ${state.originalCapturedMinor.toString()}.`
      };
    }

    return {
      allowed: true,
      remainingRefundableMinor: state.originalCapturedMinor - projectedTotal,
      updatedInFlightMinor: state.inFlightReservedMinor + requestedRefundMinor
    };
  }
}
