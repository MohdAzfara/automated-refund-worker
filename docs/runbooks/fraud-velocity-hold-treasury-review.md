# Operational Runbook: Fraud Velocity Hold (`MANUAL_REVIEW_HOLD`) & Treasury Approval SOP

## 1. Trigger Conditions

A refund job enters `MANUAL_REVIEW_HOLD` when `RefundFraudAuditor` (`src/fraud/refund-fraud-auditor.ts`) computes a composite risk score between `40` and `74` (e.g., elevated 24-hour customer refund velocity or high-value threshold trigger).

## 2. Standard Operating Procedure (SOP)

1. **Step 1 — Verify Cumulative Cap Lock**: Confirm that the in-flight refund amount remains reserved in `CumulativeRefundCapGuard` while awaiting review.
2. **Step 2 — Inspect Upstream Capture Context**: Cross-check the original 3DS2 authentication status in `checkout-flow-sdk` and vendor available balance in `payout-gateway-service`.
3. **Step 3 — Treasury Disposition**:
   * **Approve**: Issue a signed treasury override token to advance the saga to `VENDOR_BALANCE_CLAWED_BACK`.
   * **Reject**: Transition the job to `HARD_REJECT_FRAUD` and release the in-flight cumulative cap reservation.
