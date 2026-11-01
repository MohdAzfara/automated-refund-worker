# Automated Refund Worker

[![Refund CI & Security Pipeline](https://img.shields.io/badge/Refund%20CI%20%26%20Security%20Pipeline-passing-brightgreen)](https://github.com/MohdAzfara/automated-refund-worker/actions)
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
    ┌────────────┴────────────────────┐
    ▼ (2xx Refund Settled)            ▼ (Terminal Reject / Timeout)
[ Finalize Ledger Audit Trail ]   [ Compensating Saga Rollback / DLQ Quarantine ]
```

---

## 🏛️ Architectural Overview & Saga Flow

Designed as the asynchronous reversal and risk-control bridge between [`checkout-flow-sdk`](https://github.com/MohdAzfara/checkout-flow-sdk) and [`payout-gateway-service`](https://github.com/MohdAzfara/payout-gateway-service), this worker enforces strict financial invariants across every refund lifecycle stage:

1. **Cumulative Partial Refund Cap Invariant**: Synchronously locks and validates that settled plus in-flight partial refunds never exceed the original captured payment amount using 64-bit `BigInt` minor units (`src/guards/cumulative-refund-cap-guard.ts`).
2. **Pre-Dispatch Fraud & Velocity Auditing**: Evaluates 24-hour refund velocity, high-value thresholds, and account age heuristics prior to balance reversal, routing anomalous requests to manual review holds (`src/fraud/refund-fraud-auditor.ts`).
3. **Pro-Rata Connected Vendor Clawbacks**: Computes exact pro-rata vendor balance reversals and platform fee adjustments (`src/reversals/vendor-payout-reversal-calculator.ts`) with zero floating-point rounding drift.
4. **Compensating Saga Orchestration**: Coordinates multi-step state transitions between vendor balance clawbacks and acquiring PSP dispatches, automatically executing compensating vendor credits if downstream card networks terminally reject a refund (`src/saga/refund-saga-orchestrator.ts`).
5. **Full-Jitter Backoff & DLQ Quarantine**: Mitigates acquirer rate-limiting with AWS-style Full-Jitter exponential backoff and isolates ambiguous timeouts in a Dead-Letter Queue (`src/workers/refund-backoff-dlq-policy.ts`).

---

## ✨ Key Architectural Features

* **Deterministic Idempotency Guards**: Payload fingerprint attestation preventing duplicate customer credits across worker retries (`src/guards/refund-idempotency-guard.ts`).
* **Zero-Trust Webhook Attestation**: Constant-time signature verification and 300-second replay window guards (`src/security/webhook-signature-verifier.ts`).
* **Recursive PAN, IBAN & PII Scrubbing**: Automated telemetry sanitization masking sensitive payment and banking identifiers (`src/telemetry/refund-pii-redactor.ts`).
* **Formal Verification (TLA+)**: Dual mathematical specifications proving strict cumulative refund caps and saga rollback consistency (`docs/formal-verification/`).
* **High-Throughput Micro-Benchmarks**: Deterministic benchmarks for `BigInt` pro-rata allocation, fraud velocity scoring, and Full-Jitter backoff (`benchmarks/`).

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

### Formal Verification (TLA+), API Contracts & Runbooks
* [TLA+ Invariant 1: Cumulative Refund Cap Specification](docs/formal-verification/refund-cap-invariant.tla)
* [TLA+ Invariant 2: Vendor Reversal Saga State Machine Specification](docs/formal-verification/reversal-saga-state-machine.tla)
* [OpenAPI 3.1 Specification: Refund Worker Orchestration Contract](docs/api/refund-worker-events-openapi.yaml)
* [Operational Runbook: DLQ Refund Saga Quarantine & Recovery SOP](docs/runbooks/stuck-refund-dlq-recovery.md)

---

## 🤝 Contributing

We welcome contributions from distributed systems engineers and security researchers. Please review our [CONTRIBUTING.md](CONTRIBUTING.md) and adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/) standards.

---

## 📄 License

Distributed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for details.
