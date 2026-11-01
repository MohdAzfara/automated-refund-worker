# Card Network Refund, Reversal & Chargeback Compliance Matrix

This document maps `automated-refund-worker` engineering controls to global card network (Visa/Mastercard), ISO 20022, and financial audit standards.

| Control Domain | Engineering Implementation | Regulatory / Network Standard |
| :--- | :--- | :--- |
| **Over-Refund Prevention** | Atomic `BigInt` cumulative cap check (`sum(refunds) <= captured`) | PCI-DSS / Acquirer Settlement Integrity |
| **Double-Credit Prevention** | Mandatory `Idempotency-Key` deduplication across worker retries | ISO 20022 `PaymentReturn` (`pacs.004`) |
| **Vendor Split Clawback** | Pro-rata principal and platform fee reversal saga | Marketplace Split-Settlement Accounting (SOC 1) |
| **Return Abuse & Velocity** | Pre-dispatch heuristic risk scoring and manual review quarantine | Visa VAMP / Mastercard Excessive Fraud Controls |
| **Cardholder Data Privacy** | Recursive PAN, IBAN, and customer PII log scrubbing | PCI-DSS v4.0 Requirement 3 & GDPR |
