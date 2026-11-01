---
name: "🚨 Refund Reversal or Saga Discrepancy"
about: "Report an anomaly in partial refund cap calculation, vendor clawback, or DLQ saga state"
title: "[REFUND-SAGA] "
labels: ["refund-saga", "priority:critical", "fintech-invariants"]
---

## 1. Anomaly Summary
Describe the observed state mismatch between the checkout capture record, refund worker state, and vendor payout clawback (redact all live PAN/PII data).

## 2. Financial Invariant Context
- **Saga Transition State**: (e.g., `REVERSING_VENDOR_BALANCE` -> `COMPENSATING_ROLLBACK`)
- **Currency & Minor Units**: (e.g., `USD`, `BigInt cents`)
- **Refund Type**: (`FULL_REFUND` / `PRO_RATA_PARTIAL_REFUND`)

## 3. Deterministic Reproduction Steps
1. Enqueue refund job with `Idempotency-Key`...
2. Simulate downstream gateway or ledger response...
3. Observe saga compensation state...
