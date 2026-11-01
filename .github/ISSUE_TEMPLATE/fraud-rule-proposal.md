---

name: "🛡️ Fraud Velocity or Audit Rule Proposal"
about: "Propose a new deterministic heuristic or velocity threshold for refund abuse prevention"
title: "[FRAUD-RULE] "
labels: ["enhancement", "fraud-audit", "security"]
---

## 1. Threat Vector & Abuse Pattern
Specify the targeted refund abuse scenario (e.g., high-frequency partial refund probing, friendly-fraud burst velocity, cross-currency arbitrage).

## 2. Deterministic Scoring Heuristic
- What input signals are evaluated (e.g., `refundCount24h`, `cumulativeRatioBps`, `accountAgeDays`)?
- What risk score weight (0-100) and quarantine action (`AUTO_APPROVE`, `MANUAL_REVIEW`, `HARD_REJECT`) should apply?

## 3. False-Positive Mitigation
Document how legitimate merchant batch refunds are exempted or allowlisted.
