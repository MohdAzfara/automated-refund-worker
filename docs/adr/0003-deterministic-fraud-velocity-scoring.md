# ADR 0003: Deterministic Pre-Dispatch Fraud and Velocity Scoring Gates

* **Status**: Accepted
* **Date**: 2026-11-01
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

Unlike card authorizations, settled card and instant-bank refunds are frequently irreversible once dispatched to clearing rails. Compromised merchant credentials or organized return-abuse rings can drain platform liquidity via high-velocity refund bursts.

## Decision

Every refund job must pass through a **Synchronous Pre-Dispatch Fraud Auditor** prior to balance reversal:

1. **Multi-Signal Risk Evaluation**: Evaluates 24-hour customer refund velocity, refund-to-capture ratio basis points, account age, and high-value thresholds.
2. **Three-Tier Disposition**:
   * `SCORE < 40` $\rightarrow$ `AUTO_APPROVE` (Immediate asynchronous execution).
   * `40 <= SCORE < 75` $\rightarrow$ `MANUAL_REVIEW_HOLD` (Paused for treasury approval).
   * `SCORE >= 75` $\rightarrow$ `HARD_REJECT_FRAUD` (Terminated with security alert emission).

## Consequences

* **Positive**: Prevents automated liquidity drainage from compromised API keys or return-abuse spikes.
* **Negative**: Requires deterministic risk scoring rules so retry workers produce identical audit dispositions.
