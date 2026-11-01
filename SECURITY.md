# Security Policy & Refund Pipeline Compliance Boundary

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Refund Execution & Fraud Audit Security Boundaries

`automated-refund-worker` operates as the asynchronous reversal and fraud-audit bridge between [`checkout-flow-sdk`](https://github.com/MohdAzfara/checkout-flow-sdk) and [`payout-gateway-service`](https://github.com/MohdAzfara/payout-gateway-service):

1. **Cumulative Refund Cap Invariant**: Strictly validates that cumulative partial refunds never exceed the original captured payment amount (`sum(refunds) <= captured_amount`), eliminating over-refund exploits.
2. **Idempotent Queue Execution**: Every refund and vendor clawback job requires a deterministic `Idempotency-Key` locked across worker retries to prevent duplicate customer credits.
3. **Fraud & Velocity Anomaly Gating**: High-velocity or anomalous refund patterns are deterministically scored and quarantined prior to external PSP dispatch.
4. **Zero-Trust PII & PAN Scrubbing**: Customer payment tokens, bank identifiers, and dispute metadata are recursively redacted before log emission.

## Reporting a Vulnerability

Please **DO NOT** report security vulnerabilities through public GitHub issues.

* **Email**: lumilieju@hotmail.com
* **RFC 9116 Policy**: See [`.well-known/security.txt`](.well-known/security.txt)

We acknowledge receipt of all vulnerability reports within **24 hours** and provide a remediation timeline within **72 hours**.
