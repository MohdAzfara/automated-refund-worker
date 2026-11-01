# ADR 0001: Cumulative Partial Refund Cap and BigInt Minor-Unit Invariant

* **Status**: Accepted
* **Date**: 2026-11-01
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

E-commerce orders frequently undergo multiple partial refunds (e.g., item-level returns, shipping adjustments, tax credits). Concurrent background workers processing partial refund requests for the same original payment created via `checkout-flow-sdk` risk race conditions where the sum of partial refunds exceeds the original captured amount.

## Decision

We enforce a strict **Cumulative Refund Cap Invariant** using 64-bit `BigInt` minor units:

1. **Synchronous Cap Reservation**: Before dispatching any partial refund to the acquiring PSP, the worker atomically verifies and locks:
   $$\text{alreadyRefundedMinor} + \text{inFlightRefundMinor} + \text{requestedRefundMinor} \le \text{originalCapturedMinor}$$
2. **Zero Floating-Point Arithmetic**: All currency amounts and pro-rata tax/fee splits are represented exclusively as `bigint` integer minor units.

## Consequences

* **Positive**: Mathematically eliminates over-refund exploits and IEEE 754 rounding drift across arbitrary sequences of partial refunds.
* **Negative**: Requires pessimistic row-level locking or serializable state checks per parent `captureId`.
