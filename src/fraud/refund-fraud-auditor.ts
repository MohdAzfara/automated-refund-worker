export type FraudAuditDisposition = 'AUTO_APPROVE' | 'MANUAL_REVIEW_HOLD' | 'HARD_REJECT_FRAUD';

export interface RefundFraudSignalInput {
  readonly customerRefundCount24h: number;
  readonly requestedRefundMinor: bigint;
  readonly originalCapturedMinor: bigint;
  readonly accountAgeDays: number;
  readonly isCrossBorderCard: boolean;
}

export interface FraudAuditVerdict {
  readonly riskScore: number;
  readonly disposition: FraudAuditDisposition;
  readonly triggeredRules: readonly string[];
}

/**
 * Deterministic Pre-Dispatch Refund Fraud & Velocity Auditor (ADR 0003)
 * Scores refund requests to prevent return abuse and compromised key drainage.
 */
export class RefundFraudAuditor {
  private static readonly HIGH_VALUE_THRESHOLD_MINOR = 250_000n; // $2,500.00

  public auditRefundRequest(input: RefundFraudSignalInput): FraudAuditVerdict {
    let score = 0;
    const rules: string[] = [];

    if (input.customerRefundCount24h >= 4) {
      score += 40;
      rules.push('VELOCITY_BURST_24H_EXCEEDED');
    } else if (input.customerRefundCount24h >= 2) {
      score += 20;
      rules.push('ELEVATED_24H_REFUND_FREQUENCY');
    }

    if (input.requestedRefundMinor >= RefundFraudAuditor.HIGH_VALUE_THRESHOLD_MINOR) {
      score += 30;
      rules.push('HIGH_VALUE_REFUND_THRESHOLD');
    }

    if (input.accountAgeDays < 7) {
      score += 25;
      rules.push('NEW_ACCOUNT_RAPID_REFUND');
    }

    if (input.isCrossBorderCard && input.requestedRefundMinor === input.originalCapturedMinor) {
      score += 15;
      rules.push('CROSS_BORDER_FULL_REVERSAL');
    }

    const boundedScore = Math.min(100, score);
    let disposition: FraudAuditDisposition = 'AUTO_APPROVE';

    if (boundedScore >= 75) {
      disposition = 'HARD_REJECT_FRAUD';
    } else if (boundedScore >= 40) {
      disposition = 'MANUAL_REVIEW_HOLD';
    }

    return {
      riskScore: boundedScore,
      disposition,
      triggeredRules: rules
    };
  }
}
