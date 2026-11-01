export interface RefundIdempotencyEntry {
  readonly idempotencyKey: string;
  readonly payloadFingerprint: string;
  readonly state: 'IN_PROGRESS' | 'SETTLED' | 'QUARANTINED';
  readonly lockedAtMs: number;
}

/**
 * Deterministic Refund Idempotency Guard
 * Prevents duplicate customer refunds and double vendor clawbacks across worker retries.
 */
export class RefundIdempotencyGuard {
  private readonly ledger = new Map<string, RefundIdempotencyEntry>();

  public static computePayloadFingerprint(
    captureId: string,
    requestedRefundMinor: bigint,
    currency: string
  ): string {
    return `${captureId.trim()}:${requestedRefundMinor.toString()}:${currency.trim().toUpperCase()}`;
  }

  public acquireLock(
    idempotencyKey: string,
    payloadFingerprint: string,
    nowMs = Date.now()
  ): { duplicate: boolean; entry: RefundIdempotencyEntry } {
    const normalizedKey = idempotencyKey.trim();
    if (normalizedKey.length < 16 || normalizedKey.length > 128) {
      throw new Error('Invalid Refund Idempotency-Key: length must be between 16 and 128 characters.');
    }

    const existing = this.ledger.get(normalizedKey);
    if (existing) {
      if (existing.payloadFingerprint !== payloadFingerprint) {
        throw new Error(
          `Idempotency conflict: key "${normalizedKey}" reused with mutated refund parameters.`
        );
      }
      return { duplicate: true, entry: existing };
    }

    const created: RefundIdempotencyEntry = {
      idempotencyKey: normalizedKey,
      payloadFingerprint,
      state: 'IN_PROGRESS',
      lockedAtMs: nowMs
    };
    this.ledger.set(normalizedKey, created);
    return { duplicate: false, entry: created };
  }
}
