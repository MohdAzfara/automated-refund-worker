# STRIDE Threat Model: Automated Refund Worker

This document outlines the security threat analysis and cryptographic mitigation strategies implemented within `automated-refund-worker` based on the Microsoft STRIDE framework.

## 1. Spoofing Identity
* **Threat**: Unauthorized external actors publishing forged refund jobs to the background queue or spoofing acquirer settlement webhooks.
* **Mitigation**:
  * Strict HMAC-SHA256 cryptographic signature attestation and 300-second replay window guards on all inbound webhook events.
  * Authenticated producer origin verification prior to job ingestion.

## 2. Tampering with Data
* **Threat**: Manipulation of partial refund amounts or connected vendor clawback ratios in transit, causing over-refunds or platform balance drainage.
* **Mitigation**:
  * Strict 64-bit `BigInt` minor-unit arithmetic enforcing the mathematical invariant $\sum \text{refunds} \le \text{capturedAmount}$.
  * Immutable SHA-256 payload fingerprinting bound to each `Idempotency-Key`.

## 3. Repudiation
* **Threat**: Merchants or customers disputing whether a partial refund or connected account reversal was approved and executed.
* **Mitigation**:
  * Append-only audit trail recording every saga state transition (`INITIATED` $\rightarrow$ `FRAUD_AUDITED` $\rightarrow$ `VENDOR_REVERSED` $\rightarrow$ `PSP_REFUNDED`) correlated with upstream acquirer reference IDs.

## 4. Information Disclosure
* **Threat**: Accidental exposure of customer Primary Account Numbers (PAN), bank IBANs, or fraud audit metadata in worker logs.
* **Mitigation**:
  * Automated recursive PII/PAN scrubbing in telemetry pipelines (`src/telemetry/refund-pii-redactor.ts`).

## 5. Denial of Service (DoS)
* **Threat**: Flash-crowd refund storms exhausting worker threads or triggering rate-limit bans on acquiring bank APIs.
* **Mitigation**:
  * Asynchronous queue concurrency throttling paired with AWS-style Full-Jitter exponential backoff (`src/workers/refund-backoff-dlq-policy.ts`) and Dead-Letter Queue (DLQ) isolation.

## 6. Elevation of Privilege
* **Threat**: Compromised merchant API keys attempting to bypass high-value refund approval workflows or fraud velocity gates.
* **Mitigation**:
  * Mandatory deterministic fraud and velocity auditing (`src/fraud/refund-fraud-auditor.ts`) enforcing hard quarantine thresholds independent of caller privileges.
