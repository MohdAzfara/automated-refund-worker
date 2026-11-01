---------------- MODULE RefundCapInvariant ----------------
EXTENDS Integers, FiniteSets

CONSTANTS CapturedAmount, RefundRequests

VARIABLES 
    refundedTotal,
    reservedInFlight,
    processedKeys

vars == <<refundedTotal, reservedInFlight, processedKeys>>

Init ==
    /\ refundedTotal = 0
    /\ reservedInFlight = 0
    /\ processedKeys = {}

ReservePartialRefund(key, amount) ==
    /\ key \notin processedKeys
    /\ amount > 0
    /\ (refundedTotal + reservedInFlight + amount) <= CapturedAmount
    /\ reservedInFlight' = reservedInFlight + amount
    /\ processedKeys' = processedKeys \cup {key}
    /\ UNCHANGED <<refundedTotal>>

CommitPartialRefund(amount) ==
    /\ amount > 0
    /\ reservedInFlight >= amount
    /\ reservedInFlight' = reservedInFlight - amount
    /\ refundedTotal' = refundedTotal + amount
    /\ UNCHANGED <<processedKeys>>

AbortPartialRefund(amount) ==
    /\ amount > 0
    /\ reservedInFlight >= amount
    /\ reservedInFlight' = reservedInFlight - amount
    /\ UNCHANGED <<refundedTotal, processedKeys>>

Next ==
    \/ \E k \in RefundRequests, amt \in 1..CapturedAmount : ReservePartialRefund(k, amt)
    \/ \E amt \in 1..CapturedAmount : CommitPartialRefund(amt)
    \/ \E amt \in 1..CapturedAmount : AbortPartialRefund(amt)

\* Invariant 1: Cumulative settled and in-flight refunds never exceed original CapturedAmount
NoOverRefundInvariant ==
    (refundedTotal + reservedInFlight) <= CapturedAmount

\* Invariant 2: Monetary state variables remain strictly non-negative
NonNegativeRefundStateInvariant ==
    /\ refundedTotal >= 0
    /\ reservedInFlight >= 0

Spec == Init /\ [][Next]_vars
=============================================================================
