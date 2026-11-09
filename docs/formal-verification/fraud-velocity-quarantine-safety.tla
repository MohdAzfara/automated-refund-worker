---------------- MODULE FraudVelocityQuarantineSafety ----------------
EXTENDS Naturals

CONSTANTS AutoApproveCeiling, HardRejectFloor

VARIABLES 
    riskScore,
    auditDisposition,
    dispatchedToAcquirer

vars == <<riskScore, auditDisposition, dispatchedToAcquirer>>

Dispositions == {"UNAUDITED", "AUTO_APPROVE", "MANUAL_REVIEW_HOLD", "HARD_REJECT_FRAUD"}

Init ==
    /\ riskScore = 0
    /\ auditDisposition = "UNAUDITED"
    /\ dispatchedToAcquirer = FALSE

EvaluateLowRisk(score) ==
    /\ auditDisposition = "UNAUDITED"
    /\ score < AutoApproveCeiling
    /\ riskScore' = score
    /\ auditDisposition' = "AUTO_APPROVE"
    /\ dispatchedToAcquirer' = TRUE

EvaluateMediumRiskHold(score) ==
    /\ auditDisposition = "UNAUDITED"
    /\ score >= AutoApproveCeiling
    /\ score < HardRejectFloor
    /\ riskScore' = score
    /\ auditDisposition' = "MANUAL_REVIEW_HOLD"
    /\ dispatchedToAcquirer' = FALSE

EvaluateHighRiskReject(score) ==
    /\ auditDisposition = "UNAUDITED"
    /\ score >= HardRejectFloor
    /\ riskScore' = score
    /\ auditDisposition' = "HARD_REJECT_FRAUD"
    /\ dispatchedToAcquirer' = FALSE

Next ==
    \E s \in 0..100 :
        \/ EvaluateLowRisk(s)
        \/ EvaluateMediumRiskHold(s)
        \/ EvaluateHighRiskReject(s)

\* Invariant: High-risk or held refund jobs are never dispatched to the acquiring bank
FraudQuarantineGateInvariant ==
    (dispatchedToAcquirer = TRUE) => (auditDisposition = "AUTO_APPROVE" /\ riskScore < AutoApproveCeiling)

Spec == Init /\ [][Next]_vars
=============================================================================
