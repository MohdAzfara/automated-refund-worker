export interface SagaLockLease {
  readonly captureId: string;
  readonly workerOwnerId: string;
  readonly fencingToken: number;
  readonly expiresAtMs: number;
}

/**
 * Deterministic Fencing-Token Distributed Saga Lock
 * Prevents concurrent workers from mutating the same parent capture refund state.
 */
export class SagaDistributedLock {
  private readonly activeLocks = new Map<string, SagaLockLease>();
  private monotonicFencingCounter = 1;

  public acquireExclusiveLease(
    captureId: string,
    workerOwnerId: string,
    ttlMs = 15_000,
    nowMs = Date.now()
  ): SagaLockLease {
    const key = captureId.trim();
    const existing = this.activeLocks.get(key);

    if (existing && existing.expiresAtMs > nowMs && existing.workerOwnerId !== workerOwnerId) {
      throw new Error(
        `Concurrent refund lock contention on capture "${key}": lease held by worker "${existing.workerOwnerId}".`
      );
    }

    const lease: SagaLockLease = {
      captureId: key,
      workerOwnerId,
      fencingToken: this.monotonicFencingCounter++,
      expiresAtMs: nowMs + ttlMs
    };
    this.activeLocks.set(key, lease);
    return lease;
  }
}
