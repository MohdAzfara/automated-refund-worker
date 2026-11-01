# Contributing to Automated Refund Worker

We welcome contributions from distributed systems engineers and fintech security researchers. Because this worker executes irreversible customer refunds and connected vendor balance clawbacks, all changes must uphold strict mathematical and operational invariants.

## 1. Core Engineering Invariants

* **Zero Over-Refund Guarantee**: Partial refund calculations must strictly enforce `cumulativeRefundedMinor + requestedRefundMinor <= originalCapturedMinor` using 64-bit `bigint` minor units.
* **Idempotent Saga Transitions**: Every state transition across checkout capture reversal and vendor payout clawback must be deterministically idempotent.
* **Fraud Gate Integrity**: Velocity and return-abuse scoring rules must execute deterministically without external side effects.

## 2. Commit Message Convention

We strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat(saga): ...` for distributed refund saga and compensating transaction logic
* `feat(fraud): ...` for velocity scoring and anomaly detection rules
* `feat(reversals): ...` for connected vendor payout clawback calculations
* `docs(verification): ...` for TLA+ formal specifications and ADRs
* `perf(bench): ...` for worker throughput and allocation micro-benchmarks

## 3. Pull Request Quality Gates

1. Verify `npx tsc --noEmit` passes with zero compilation errors.
2. Ensure 100% pure TypeScript implementation across all modules and configurations.
3. Update relevant Architecture Decision Records (`docs/adr/`) when modifying state machine semantics.
