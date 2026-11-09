# ADR 0006: Double-Entry Contra-Entry Journal Emission for Refund Reversals

* **Status**: Accepted
* **Date**: 2026-11-03
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

Because `double-entry-ledger-core` enforces strict append-only immutability (`ADR 0002`), partial or full customer refunds executed by `automated-refund-worker` cannot mutate the original capture journal entry posted by `checkout-flow-sdk`.

## Decision

Every settled refund emits an atomic **Compensating Contra-Entry Journal Batch** to `double-entry-ledger-core`:

1. **Explicit Reversal Linkage**: Sets `reversesJournalId` to the original capture journal ID.
2. **Pro-Rata Split Reversal**: Debits `acct_vendor_payable` (`vendorClawbackMinor`) and `acct_platform_fee_revenue` (`platformFeeRefundMinor`), and credits `acct_psp_clearing` (`requestedRefundMinor`), satisfying $\sum \text{Debits} = \sum \text{Credits}$.

## Consequences

* **Positive**: Maintains 100% immutable auditability and zero-sum conservation across all 4 repositories.
* **Negative**: Requires exact pro-rata `BigInt` split calculation prior to journal emission.
