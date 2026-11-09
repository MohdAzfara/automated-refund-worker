export interface ContraJournalLine {
  readonly accountId: string;
  readonly direction: 'DEBIT' | 'CREDIT';
  readonly amountMinor: bigint;
  readonly currency: string;
}

export interface RefundContraJournalEnvelope {
  readonly reversesJournalId: string;
  readonly idempotencyKey: string;
  readonly currency: string;
  readonly totalRefundedMinor: bigint;
  readonly lines: readonly ContraJournalLine[];
}

/**
 * Double-Entry Refund Contra-Journal Emitter (ADR 0006)
 * Emits balanced compensating journal batches to double-entry-ledger-core.
 */
export class ContraJournalEmitter {
  public buildContraJournalBatch(params: {
    reversesJournalId: string;
    idempotencyKey: string;
    currency: string;
    requestedRefundMinor: bigint;
    vendorClawbackMinor: bigint;
    platformFeeRefundMinor: bigint;
    vendorPayableAccountId: string;
    platformFeeAccountId: string;
    pspClearingAccountId: string;
  }): RefundContraJournalEnvelope {
    if (
      params.requestedRefundMinor <= 0n ||
      params.vendorClawbackMinor + params.platformFeeRefundMinor !== params.requestedRefundMinor
    ) {
      throw new Error('Contra-journal split violation: vendor clawback + fee refund must equal total refund.');
    }

    const normCurrency = params.currency.trim().toUpperCase();
    const lines: ContraJournalLine[] = [
      {
        accountId: params.vendorPayableAccountId,
        direction: 'DEBIT',
        amountMinor: params.vendorClawbackMinor,
        currency: normCurrency
      }
    ];

    if (params.platformFeeRefundMinor > 0n) {
      lines.push({
        accountId: params.platformFeeAccountId,
        direction: 'DEBIT',
        amountMinor: params.platformFeeRefundMinor,
        currency: normCurrency
      });
    }

    lines.push({
      accountId: params.pspClearingAccountId,
      direction: 'CREDIT',
      amountMinor: params.requestedRefundMinor,
      currency: normCurrency
    });

    return {
      reversesJournalId: params.reversesJournalId,
      idempotencyKey: params.idempotencyKey,
      currency: normCurrency,
      totalRefundedMinor: params.requestedRefundMinor,
      lines
    };
  }
}
