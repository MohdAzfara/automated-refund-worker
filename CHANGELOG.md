# Changelog

All notable changes to `automated-refund-worker` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-01

### Added
- Event-driven asynchronous refund worker pipeline with deterministic idempotency enforcement.
- Cumulative partial refund cap guard preventing over-refund anomalies across multi-step partial reversals.
- Pro-rata vendor payout reversal and platform fee clawback calculator synchronized with `payout-gateway-service`.
- Real-time fraud and refund velocity scoring engine with automatic manual-review quarantine gates.
- Distributed compensating Saga orchestrator managing multi-stage checkout refund and ledger adjustment rollbacks.
- Dual TLA+ formal verification specifications (`docs/formal-verification/`), STRIDE threat model (`docs/threat-model.md`), and RFC 9116 security policy (`.well-known/security.txt`).
