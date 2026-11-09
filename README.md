# Automated Refund Worker

[![Refund CI Pipeline](https://img.shields.io/badge/Refund_CI_Pipeline-passing-brightgreen.svg)](https://github.com/MohdAzfara/automated-refund-worker/actions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1.0-6ba539.svg)](docs/api/refund-worker-events-openapi.yaml)
[![SemVer](https://img.shields.io/badge/SemVer-1.0.0-green.svg)](https://semver.org/)

An event-driven, enterprise-grade TypeScript background worker engineered for idempotent full and partial refund pipelines, pre-dispatch fraud velocity auditing, and distributed vendor payout reversal sagas.

---

## 🗺️ Refund Saga & Fraud Audit Execution Flow

```text
[ Refund Trigger (Full / Partial) ]
                 │
                 ▼
[ Idempotency & Cumulative Cap Guard ] ──(Enforce: Σ Refunds <= Captured BigInt)
                 │
                 ▼
[ Pre-Dispatch Fraud Velocity Auditor ] ─(Score < 40: Approve │ >= 40: Hold/Reject)
                 │
                 ▼
[ Pro-Rata Vendor Payout Reversal ] ─────(Clawback Connected Vendor & Fee Split)
                 │
                 ▼
[ Acquiring PSP Refund Worker Queue ] ───(Full-Jitter Exponential Backoff)
                 │
    ┌────────────┴─────────────────────────┐
    ▼ (2xx Refund Settled)                 ▼ (Terminal Reject / Timeout)
[ Emit Double-Entry Contra-Journal ]   [ Compensating Saga Rollback / DLQ Quarantine ]
```

---

## 🏛️ Architectural Overview & Ecosystem Integration

Serving as the asynchronous reversal and risk-control bridge connecting [`checkout-flow-sdk`](https://github.com/MohdAzfara/checkout-flow-sdk) (Inbound Capture), [`payout-gateway-service`](https://github.com/MohdAzfara/payout-gateway-service) (Vendor Disbursement), and [`double-entry-ledger-core`](https://github.com/MohdAzfara/double-entry-ledger-core) (Immutable Accounting), this worker enforces strict financial invariants:

1. **Cumulative Partial Refund Cap Invariant**: Synchronously locks and validates that settled plus in-flight partial refunds never exceed the original captured payment amount using 64-bit `BigInt` minor units (`src/guards/cumulative-refund-cap-guard.ts`).
2. **Pre-Dispatch Fraud & Velocity Auditing**: Evaluates 24-hour refund velocity, high-value thresholds, and account age heuristics prior to balance reversal, routing anomalous requests to manual review holds (`src/fraud/refund-fraud-auditor.ts`).
3. **Pro-Rata Connected Vendor Clawbacks**: Computes exact pro-rata vendor balance reversals and platform fee adjustments (`src/reversals/vendor-payout-reversal-calculator.ts`) with zero floating-point rounding drift.
4. **Compensating Saga Orchestration**: Coordinates multi-step state transitions between vendor balance clawbacks and acquiring PSP dispatches, automatically executing compensating vendor credits if downstream card networks terminally reject a refund (`src/saga/refund-saga-orchestrator.ts`).
5. **Double-Entry Contra-Journal Emission**: Emits balanced compensating contra-entry journal batches (`src/ledger/contra-journal-emitter.ts`) linked via `reversesJournalId` to `double-entry-ledger-core`.

---

## ✨ Key Architectural Features

* **Fencing-Token Distributed Saga Locks**: Prevents concurrent workers from mutating the same parent capture state (`src/concurrency/saga-distributed-lock.ts`).
* **Zero-Trust Webhook Attestation**: Constant-time signature verification and 300-second replay window guards (`src/security/webhook-signature-verifier.ts`).
* **Recursive PAN, IBAN & PII Scrubbing**: Automated telemetry sanitization masking sensitive payment and banking identifiers (`src/telemetry/refund-pii-redactor.ts`).
* **Formal Verification (TLA+)**: Triple mathematical specifications proving strict cumulative refund caps, saga rollback consistency, and fraud quarantine gate safety (`docs/formal-verification/`).
* **High-Throughput Micro-Benchmarks**: Deterministic benchmarks for `BigInt` pro-rata allocation, fraud velocity scoring, 64-bit fingerprinting, Full-Jitter backoff, and saga compensation (`benchmarks/`).

---

## 🔒 Security, Compliance & Vulnerability Disclosure

We treat refund integrity, fraud prevention, and cardholder data protection as non-negotiable priorities:

* **Security Policy & Compliance Boundaries**: Review our [SECURITY.md](SECURITY.md) for cumulative cap locks, fraud gating, and PII redaction standards.
* **STRIDE Threat Model**: Comprehensive threat analysis and cryptographic mitigations are documented in [docs/threat-model.md](docs/threat-model.md).
* **Card Network & ISO 20022 Compliance Matrix**: Alignment with `pacs.004` payment returns, Visa/Mastercard fraud controls, and SOC 1 split-settlement accounting is documented in [docs/compliance/dispute-and-chargeback-controls.md](docs/compliance/dispute-and-chargeback-controls.md).
* **RFC 9116 Compliance**: Standardized vulnerability disclosure contact policy is published at [.well-known/security.txt](.well-known/security.txt).

---

## 📚 Documentation, Specifications & Runbooks

### Architecture Decision Records (ADRs)
* [ADR 0001: Cumulative Partial Refund Cap and BigInt Minor-Unit Invariant](docs/adr/0001-cumulative-partial-refund-cap-invariant.md)
* [ADR 0002: Distributed Saga Orchestration for Connected Vendor Payout Reversals](docs/adr/0002-distributed-saga-vendor-payout-reversal.md)
* [ADR 0003: Deterministic Pre-Dispatch Fraud and Velocity Scoring Gates](docs/adr/0003-deterministic-fraud-velocity-scoring.md)
* [ADR 0004: Idempotent Queue Workers, Full-Jitter Backoff, and DLQ Quarantine](docs/adr/0004-idempotent-redis-stream-worker-dlq.md)
* [ADR 0005: ISO 20022 PACS.004 Payment Return Reason Code Mapping](docs/adr/0005-iso20022-pacs004-payment-return-mapping.md)
* [ADR 0006: Double-Entry Contra-Entry Journal Emission for Refund Reversals](docs/adr/0006-double-entry-contra-journal-emission.md)

### Formal Verification (TLA+), API Contracts & Operational Runbooks
* [TLA+ Invariant 1: Cumulative Refund Cap Specification](docs/formal-verification/refund-cap-invariant.tla)
* [TLA+ Invariant 2: Vendor Reversal Saga State Machine Specification](docs/formal-verification/reversal-saga-state-machine.tla)
* [TLA+ Invariant 3: Pre-Dispatch Fraud Quarantine Gate Specification](docs/formal-verification/fraud-velocity-quarantine-safety.tla)
* [OpenAPI 3.1 Specification: Refund Worker Orchestration Contract](docs/api/refund-worker-events-openapi.yaml)
* [Operational Runbook 1: DLQ Refund Saga Quarantine & Recovery SOP](docs/runbooks/stuck-refund-dlq-recovery.md)
* [Operational Runbook 2: Fraud Velocity Hold & Treasury Review SOP](docs/runbooks/fraud-velocity-hold-treasury-review.md)

---

## 🤝 Contributing

We welcome contributions from distributed systems engineers and security researchers. Please review our [CONTRIBUTING.md](CONTRIBUTING.md) and adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/) standards.

---

## 📄 License

Distributed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for details.
