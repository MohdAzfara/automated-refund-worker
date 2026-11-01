# Operational Runbook: Dead-Letter Queue (DLQ) Refund Saga Quarantine & Recovery

## 1. Incident Trigger Conditions

A refund worker job enters `DLQ_QUARANTINED` status when:
1. Vendor balance clawback succeeded in `payout-gateway-service`, but the acquiring PSP returned `HTTP 504 Gateway Timeout` after maximum exponential backoff retries.
2. Inbound refund settlement webhook failed `HMAC-SHA256` signature verification.
3. Fraud velocity score landed in the `MANUAL_REVIEW_HOLD` threshold (`40 <= score < 75`) and exceeded SLA review window.

## 2. Golden Rule of Refund Saga Recovery

> **NEVER** execute a compensating vendor credit or release the cumulative refund cap reservation until the acquiring PSP confirms whether the customer refund (`Idempotency-Key`) settled or was rejected.

## 3. Standard Operating Procedure (SOP)

1. **Step 1 — Inspect Saga State Snapshot**: Retrieve `refundJobId`, `captureId`, `idempotencyKey`, and `vendorReversalId` from the DLQ payload.
2. **Step 2 — Query Acquiring PSP by Idempotency-Key**:
   * **Branch A (PSP confirms `REFUND_SETTLED`)**: Advance saga state to `PSP_SETTLED` and finalize the cumulative refund cap deduction.
   * **Branch B (PSP confirms `REFUND_NOT_FOUND` or `TERMINAL_REJECT`)**: Trigger `COMPENSATING_VENDOR_CREDIT` to restore the connected vendor's balance in `payout-gateway-service` and release the in-flight refund cap reservation.
