---------------- MODULE ReversalSagaStateMachine ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS MaxRetries

VARIABLES 
    sagaState,
    vendorClawedBack,
    customerRefunded,
    retryCount

vars == <<sagaState, vendorClawedBack, customerRefunded, retryCount>>

States == {
    "INITIATED",
    "FRAUD_APPROVED",
    "VENDOR_REVERSED",
    "PSP_SETTLED",
    "COMPENSATING_VENDOR_CREDIT",
    "SAGA_ROLLED_BACK",
    "DLQ_QUARANTINED"
}

Init ==
    /\ sagaState = "INITIATED"
    /\ vendorClawedBack = FALSE
    /\ customerRefunded = FALSE
    /\ retryCount = 0

PassFraudAudit ==
    /\ sagaState = "INITIATED"
    /\ sagaState' = "FRAUD_APPROVED"
    /\ UNCHANGED <<vendorClawedBack, customerRefunded, retryCount>>

ExecuteVendorClawback ==
    /\ sagaState = "FRAUD_APPROVED"
    /\ sagaState' = "VENDOR_REVERSED"
    /\ vendorClawedBack' = TRUE
    /\ UNCHANGED <<customerRefunded, retryCount>>

CompleteCustomerRefund ==
    /\ sagaState = "VENDOR_REVERSED"
    /\ sagaState' = "PSP_SETTLED"
    /\ customerRefunded' = TRUE
    /\ UNCHANGED <<vendorClawedBack, retryCount>>

TriggerCompensatingRollback ==
    /\ sagaState = "VENDOR_REVERSED"
    /\ customerRefunded = FALSE
    /\ sagaState' = "COMPENSATING_VENDOR_CREDIT"
    /\ UNCHANGED <<vendorClawedBack, customerRefunded, retryCount>>

FinalizeSagaRollback ==
    /\ sagaState = "COMPENSATING_VENDOR_CREDIT"
    /\ vendorClawedBack' = FALSE
    /\ sagaState' = "SAGA_ROLLED_BACK"
    /\ UNCHANGED <<customerRefunded, retryCount>>

QuarantineAmbiguousTimeout ==
    /\ sagaState = "VENDOR_REVERSED"
    /\ retryCount >= MaxRetries
    /\ sagaState' = "DLQ_QUARANTINED"
    /\ UNCHANGED <<vendorClawedBack, customerRefunded, retryCount>>

Next ==
    \/ PassFraudAudit
    \/ ExecuteVendorClawback
    \/ CompleteCustomerRefund
    \/ TriggerCompensatingRollback
    \/ FinalizeSagaRollback
    \/ QuarantineAmbiguousTimeout

\* Invariant: A rolled-back saga must never leave the vendor balance clawed back
SagaCompensationConsistencyInvariant ==
    (sagaState = "SAGA_ROLLED_BACK") => (vendorClawedBack = FALSE /\ customerRefunded = FALSE)

Spec == Init /\ [][Next]_vars
=============================================================================
