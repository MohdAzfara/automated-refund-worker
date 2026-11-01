# ADR 0004: Idempotent Queue Workers, Full-Jitter Backoff, and DLQ Quarantine

* **Status**: Accepted
* **Date**: 2026-11-01
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

Acquiring banks and card networks experience intermittent gateway degradation and rate-limiting during peak settlement windows. Immediate retries amplify congestion, while dropping failed jobs leaves ledger reservations in an inconsistent state.

## Decision

We standardize worker resilience around **AWS-Style Full-Jitter Exponential Backoff and DLQ Quarantine**:

1. **Idempotent Job Locking**: Workers acquire a deterministic lock keyed by `Idempotency-Key` before executing any state transition.
2. **Full-Jitter Retry Schedule**: Transient network timeouts retry with randomized exponential delay `random(0, min(capMs, baseMs * 2^attempt))`.
3. **DLQ Quarantine Invariant**: Jobs exhausting maximum retries transition to `DLQ_QUARANTINED` without releasing the reserved refund cap until manual or automated reconciliation confirms upstream PSP status.

## Consequences

* **Positive**: Protects downstream payment gateways from retry storms and prevents double-refund anomalies on ambiguous timeouts.
* **Negative**: Requires operational runbooks (`docs/runbooks/`) to resolve quarantined DLQ jobs.
