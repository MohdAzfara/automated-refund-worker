## Summary of Changes

Please provide a concise architectural summary of the changes introduced in this Pull Request.

## Refund & Fraud Audit Compliance Checklist

- [ ] **Cumulative Cap Enforced**: Partial and full refund paths strictly guarantee `sum(refunds) <= captured_amount` using `BigInt` minor units.
- [ ] **Idempotency Guaranteed**: All queue jobs and saga steps enforce deterministic `Idempotency-Key` deduplication.
- [ ] **Vendor Clawback Parity**: Connected account balance reversals accurately reconcile with `payout-gateway-service`.
- [ ] **Zero PII/PAN Leakage**: Sensitive customer payment tokens and bank details are scrubbed from logs.
- [ ] **Static Verification**: `npx tsc --noEmit` passes with zero compilation or type errors.
