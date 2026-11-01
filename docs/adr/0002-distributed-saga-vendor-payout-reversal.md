# ADR 0002: Distributed Saga Orchestration for Connected Vendor Payout Reversals

* **Status**: Accepted
* **Date**: 2026-11-01
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

In multi-vendor marketplace transactions, captured funds are split between the platform and connected vendors managed by `payout-gateway-service`. Refunding a customer without clawing back the vendor's share leaves the platform bearing 100% of the financial loss.

## Decision

We implement a **Deterministic Multi-Step Refund Saga** with compensating rollback actions:

1. **Step 1 — Vendor Balance Clawback**: Execute an idempotent reversal against the vendor's pending/available balance in `payout-gateway-service` proportional to the refund amount.
2. **Step 2 — Customer PSP Refund Dispatch**: Execute the outbound card/wallet refund via the acquiring payment gateway.
3. **Compensating Rollback**: If Step 2 fails terminally at the acquiring bank (`ACCOUNT_CLOSED` / `CARD_EXPIRED`), the saga orchestrator automatically executes a compensating credit to restore the vendor's clawed-back balance.

## Consequences

* **Positive**: Guarantees strict balance conservation between customer refunds and connected vendor ledgers.
* **Negative**: Ambiguous network timeouts during Step 2 must be quarantined in the Dead-Letter Queue (DLQ) until upstream finality is confirmed.
