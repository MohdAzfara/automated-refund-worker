export interface WorkerRetryDecision {
  readonly nextAction: 'SCHEDULE_RETRY' | 'ISOLATE_IN_DLQ' | 'ABORT_TERMINAL';
  readonly delayMs: number;
  readonly diagnosticNote: string;
}

/**
 * AWS-Style Full-Jitter Exponential Backoff & DLQ Escalation Policy (ADR 0004)
 */
export class RefundBackoffDlqPolicy {
  constructor(
    private readonly maxRetryAttempts = 5,
    private readonly baseDelayMs = 200,
    private readonly maxCapDelayMs = 30_000
  ) {}

  public evaluateWorkerFailure(
    attempt: number,
    retryable: boolean,
    deterministicFactor?: number
  ): WorkerRetryDecision {
    if (!retryable) {
      return {
        nextAction: 'ABORT_TERMINAL',
        delayMs: 0,
        diagnosticNote: 'Non-retryable validation or terminal acquirer rejection; triggering saga compensation.'
      };
    }

    if (attempt >= this.maxRetryAttempts) {
      return {
        nextAction: 'ISOLATE_IN_DLQ',
        delayMs: 0,
        diagnosticNote: `Retry ceiling (${this.maxRetryAttempts}) reached; quarantining job in DLQ for reconciliation.`
      };
    }

    const ceiling = Math.min(
      this.maxCapDelayMs,
      this.baseDelayMs * Math.pow(2, Math.max(0, attempt))
    );
    const jitter =
      deterministicFactor !== undefined
        ? Math.max(0, Math.min(1, deterministicFactor))
        : Math.random();

    return {
      nextAction: 'SCHEDULE_RETRY',
      delayMs: Math.floor(jitter * ceiling),
      diagnosticNote: `Transient gateway timeout on attempt ${attempt + 1}/${this.maxRetryAttempts}.`
    };
  }
}
