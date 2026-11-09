# ADR 0005: ISO 20022 PACS.004 Payment Return Reason Code Mapping

* **Status**: Accepted
* **Date**: 2026-11-03
* **Deciders**: Principal Distributed Systems & Fintech Architecture Team

## Context

Downstream acquiring banks and clearing houses report refund rejections and settlement returns using heterogeneous proprietary codes alongside ISO 20022 `pacs.004` (`PaymentReturn`) messages.

## Decision

We standardize all refund reason and rejection codes around **ISO 20022 `pacs.004` Return Reason Taxonomy**:

1. **Terminal vs. Transient Classification**: Maps `AC04` (Closed Account) and `MD01` (No Mandate) to terminal saga compensation rollbacks, while mapping network timeouts to Full-Jitter retry queues.
2. **End-to-End Audit Traceability**: Preserves the original `captureId` from `checkout-flow-sdk` inside the `OriginalEndToEndIdentification` field.

## Consequences

* **Positive**: Eliminates ambiguity when deciding whether `RefundSagaOrchestrator` should retry or trigger a compensating vendor credit.
* **Negative**: Requires maintaining a canonical mapping table across acquiring PSP adapters.
