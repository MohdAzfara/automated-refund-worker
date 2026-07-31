# Refund Management System

A refund management module for handling full refunds, partial refunds, refund approvals, payment reversals, balance adjustments, and refund status tracking.

This module is designed to work with the existing Checkout and Payout platform using Stripe.

## Overview

The Refund system allows customers, administrators, and sellers to manage refund requests securely and consistently.

The system supports:

- Full refunds
- Partial refunds
- Multiple partial refunds
- Refund request approval
- Refund rejection
- Refund status tracking
- Seller balance adjustments
- Platform fee adjustments
- Payout protection
- Refund notifications
- Refund audit logs

## Refund Flow

```text
Customer
   │
   ▼
Submit Refund Request
   │
   ▼
Backend API
   │
   ├── Validate Order
   ├── Validate Payment
   ├── Check Refund Eligibility
   ├── Calculate Refund Amount
   └── Create Refund Request
   │
   ▼
Admin or Seller Review
   │
   ├── Approve Refund
   └── Reject Refund
   │
   ▼
Stripe Refund API
   │
   ▼
Stripe Webhook
   │
   ├── Verify Refund Status
   ├── Update Payment
   ├── Update Order
   ├── Adjust Seller Balance
   ├── Adjust Platform Fee
   └── Create Ledger Entries
   │
   ▼
Customer Notification
```

## Architecture

```text
Frontend
├── Refund Request Form
├── Order Details
├── Refund Status Page
├── Seller Refund Dashboard
└── Admin Refund Dashboard

Backend API
├── Authentication Service
├── Order Service
├── Payment Service
├── Refund Service
├── Balance Service
├── Ledger Service
├── Notification Service
└── Webhook Service

Infrastructure
├── PostgreSQL
├── Redis
├── Stripe API
├── Background Workers
├── Email Service
└── Logging and Monitoring
```

## Suggested Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express or NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ

### Payment Infrastructure

- Stripe PaymentIntents
- Stripe Charges
- Stripe Refunds
- Stripe Connect
- Stripe Transfers
- Stripe Webhooks

## Refund Types

### Full Refund

Returns the entire refundable payment amount to the customer.

```text
Original payment: $100.00
Refund amount:    $100.00
Remaining amount: $0.00
```

### Partial Refund

Returns only part of the original payment amount.

```text
Original payment: $100.00
Refund amount:    $30.00
Remaining amount: $70.00
```

### Multiple Partial Refunds

Allows multiple refunds until the full refundable amount has been reached.

```text
Original payment: $100.00
First refund:     $20.00
Second refund:    $30.00
Remaining amount: $50.00
```

## Refund Reasons

```text
duplicate
fraudulent
requested_by_customer
product_not_received
product_damaged
incorrect_product
service_not_provided
order_cancelled
billing_error
other
```

## Refund Statuses

```text
requested
under_review
approved
processing
succeeded
failed
rejected
cancelled
requires_action
```

## Refund Eligibility

A refund request should be accepted only when:

- The order exists
- The payment was completed successfully
- The payment has not been fully refunded
- The requested amount is greater than zero
- The requested amount does not exceed the refundable balance
- The refund request is within the allowed refund period
- The requester has permission to access the order
- The order is not currently involved in an unresolved dispute
- The refund request is not a duplicate

## Refund Calculation

The maximum refundable amount should be calculated as:

```text
Refundable Amount =
Original Payment Amount
- Successful Refund Amount
- Pending Refund Amount
```

Example:

```text
Original payment:          $150.00
Successful refunds:         $40.00
Pending refunds:            $20.00
Maximum refundable amount:  $90.00
```

All monetary values should be stored as integers in the smallest currency unit.

Example:

```text
$10.00 = 1000 cents
$49.99 = 4999 cents
```

## Database Models

### RefundRequest

```text
id
orderId
paymentId
customerId
sellerId
requestedBy
amount
currency
reason
description
status
reviewedBy
reviewedAt
approvedAt
rejectedAt
createdAt
updatedAt
```

### Refund

```text
id
refundRequestId
orderId
paymentId
stripeRefundId
amount
currency
status
reason
failureReason
processedAt
createdAt
updatedAt
```

### RefundItem

```text
id
refundRequestId
orderItemId
quantity
unitAmount
refundAmount
createdAt
updatedAt
```

### RefundEvidence

```text
id
refundRequestId
fileUrl
fileType
description
uploadedBy
createdAt
```

### LedgerEntry

```text
id
sellerId
orderId
paymentId
refundId
payoutId
type
amount
currency
balanceAfter
createdAt
```

## Order Statuses

```text
pending
processing
paid
partially_refunded
refunded
cancelled
payment_failed
```

An order should be marked as:

```text
partially_refunded
```

when the total successful refund amount is lower than the original payment amount.

An order should be marked as:

```text
refunded
```

when the entire refundable payment amount has been returned.

## API Endpoints

### Customer Refund Requests

```http
POST /api/orders/:orderId/refund-requests
GET  /api/orders/:orderId/refund-requests
GET  /api/refund-requests/:refundRequestId
POST /api/refund-requests/:refundRequestId/cancel
```

### Seller Refund Management

```http
GET  /api/seller/refund-requests
GET  /api/seller/refund-requests/:refundRequestId
POST /api/seller/refund-requests/:refundRequestId/approve
POST /api/seller/refund-requests/:refundRequestId/reject
```

### Admin Refund Management

```http
GET  /api/admin/refund-requests
GET  /api/admin/refund-requests/:refundRequestId
POST /api/admin/refund-requests/:refundRequestId/approve
POST /api/admin/refund-requests/:refundRequestId/reject
POST /api/admin/refunds
```

### Refund Records

```http
GET /api/refunds
GET /api/refunds/:refundId
```

### Webhooks

```http
POST /api/webhooks/stripe
```

## Create Refund Request

Example request:

```json
{
  "amount": 3000,
  "currency": "usd",
  "reason": "product_damaged",
  "description": "The product arrived damaged.",
  "items": [
    {
      "orderItemId": "item_123",
      "quantity": 1
    }
  ]
}
```

Example response:

```json
{
  "id": "refund_request_123",
  "orderId": "order_123",
  "paymentId": "payment_123",
  "amount": 3000,
  "currency": "usd",
  "reason": "product_damaged",
  "status": "requested",
  "createdAt": "2026-07-31T07:00:00.000Z"
}
```

## Approve Refund Request

Example request:

```json
{
  "approvedAmount": 3000,
  "reviewNote": "Refund approved after reviewing customer evidence."
}
```

Example response:

```json
{
  "refundRequestId": "refund_request_123",
  "refundId": "refund_123",
  "amount": 3000,
  "currency": "usd",
  "status": "processing"
}
```

## Reject Refund Request

Example request:

```json
{
  "reason": "The order was delivered correctly and no valid evidence was provided."
}
```

Example response:

```json
{
  "refundRequestId": "refund_request_123",
  "status": "rejected",
  "reviewedAt": "2026-07-31T07:30:00.000Z"
}
```

## Stripe Refund Integration

A refund can be created using the Stripe API:

```ts
const refund = await stripe.refunds.create(
  {
    payment_intent: payment.stripePaymentIntentId,
    amount: refundAmount,
    reason: "requested_by_customer",
    metadata: {
      orderId: order.id,
      refundRequestId: refundRequest.id,
    },
  },
  {
    idempotencyKey: `refund-${refundRequest.id}`,
  }
);
```

The backend should never trust the frontend to determine the final refundable amount.

The refund amount must be recalculated and validated on the server before calling Stripe.

## Stripe Connect Refunds

For marketplace payments, the refund logic depends on how the original payment was created.

The platform may need to:

- Refund the customer payment
- Reverse the seller transfer
- Refund the application fee
- Deduct the amount from the seller balance
- Create a negative balance when funds are unavailable

Example:

```ts
const refund = await stripe.refunds.create({
  payment_intent: payment.stripePaymentIntentId,
  amount: refundAmount,
  reverse_transfer: true,
  refund_application_fee: true,
});
```

The correct configuration depends on whether the payment uses:

- Direct charges
- Destination charges
- Separate charges and transfers

## Seller Balance Adjustment

When a refund succeeds, the seller balance should be adjusted.

Example:

```text
Seller available balance: $500.00
Refund amount:             $50.00
New available balance:    $450.00
```

If the available balance is insufficient:

```text
Seller available balance:  $20.00
Refund amount:              $50.00
New seller balance:        -$30.00
```

The system may recover a negative balance from:

- Future sales
- Pending balances
- Unpaid payouts
- Seller bank account debits, when supported
- Manual seller repayment

## Payout Protection

Before processing a seller payout, the system should reserve funds for:

- Pending refund requests
- Approved refunds
- Active disputes
- Platform risk reserves
- Chargeback exposure

Example:

```text
Seller available balance: $1,000.00
Pending refunds:            $150.00
Risk reserve:               $100.00
Payout-eligible balance:    $750.00
```

A payout should not include funds reserved for an active refund.

## Ledger Entries

Every refund should create immutable ledger entries.

Example:

```text
Payment completed:     +$100.00
Platform fee:           -$10.00
Seller earnings:        +$90.00
Customer refund:        -$40.00
Fee adjustment:          +$4.00
Seller adjustment:      -$36.00
```

Suggested ledger entry types:

```text
payment_credit
platform_fee
seller_credit
refund_debit
refund_fee_adjustment
transfer_reversal
payout_debit
balance_reserve
balance_release
```

## Stripe Webhook Events

The application should process relevant Stripe events:

```text
refund.created
refund.updated
refund.failed
charge.refunded
charge.refund.updated
payment_intent.succeeded
charge.dispute.created
charge.dispute.closed
```

Webhook signatures must always be verified before processing an event.

## Webhook Processing

Recommended webhook flow:

```text
Receive Stripe Event
   │
   ▼
Verify Webhook Signature
   │
   ▼
Check Event Idempotency
   │
   ▼
Store Raw Event
   │
   ▼
Process Refund Status
   │
   ├── Update Refund Record
   ├── Update Refund Request
   ├── Update Order Status
   ├── Update Payment Totals
   ├── Create Ledger Entries
   └── Send Notification
```

The application should store processed Stripe event IDs to prevent duplicate processing.

## Idempotency

Refund operations must be idempotent.

The same refund request must not create multiple Stripe refunds when:

- The user submits the form more than once
- An API request is retried
- A background worker retries a failed job
- A webhook is delivered multiple times
- A network timeout occurs after Stripe processes the refund

Recommended idempotency key:

```text
refund-{refundRequestId}
```

## Refund Failure Handling

A refund may fail because of:

- Insufficient connected account balance
- Invalid payment reference
- Refund amount exceeding the available amount
- Payment method limitations
- Closed or restricted connected account
- Currency mismatch
- Stripe API errors
- Network errors

When a refund fails, the system should:

- Store the failure reason
- Mark the refund as failed
- Preserve the original request
- Release reserved funds when appropriate
- Notify the administrator
- Notify the seller
- Allow safe retrying
- Record the failure in the audit log

## Notifications

The system may send notifications when:

```text
refund_requested
refund_under_review
refund_approved
refund_rejected
refund_processing
refund_succeeded
refund_failed
```

Notification channels may include:

- Email
- In-app notifications
- Seller dashboard alerts
- Admin dashboard alerts
- Webhooks for external systems

## Security Requirements

- Require authentication for all refund actions
- Verify that customers own the affected order
- Use role-based authorization
- Validate refund amounts on the backend
- Verify Stripe webhook signatures
- Use idempotency keys
- Prevent duplicate refund requests
- Prevent refunds above the refundable balance
- Store monetary values as integers
- Record every status change
- Maintain immutable ledger entries
- Rate-limit refund request endpoints
- Protect uploaded refund evidence
- Never expose Stripe secret keys
- Never store raw card information

## Audit Log

Every refund action should create an audit record.

Suggested fields:

```text
id
actorId
actorRole
action
refundRequestId
refundId
previousStatus
newStatus
metadata
ipAddress
userAgent
createdAt
```

Example actions:

```text
refund_request_created
refund_request_cancelled
refund_request_approved
refund_request_rejected
refund_created
refund_succeeded
refund_failed
refund_retried
refund_manually_updated
```

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=

REDIS_URL=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

APP_URL=http://localhost:3000
JWT_SECRET=

REFUND_WINDOW_DAYS=30
REFUND_AUTO_APPROVAL_LIMIT=5000
```

Do not commit environment variables or secret keys to the repository.

## Recommended Project Structure

```text
src/
├── app/
│   ├── orders/
│   ├── refunds/
│   ├── seller/
│   ├── admin/
│   └── api/
├── components/
│   ├── refund-request-form/
│   ├── refund-status/
│   ├── refund-history/
│   └── refund-review/
├── modules/
│   ├── auth/
│   ├── orders/
│   ├── payments/
│   ├── refunds/
│   ├── balances/
│   ├── ledger/
│   ├── notifications/
│   └── webhooks/
├── lib/
│   ├── database.ts
│   ├── redis.ts
│   └── stripe.ts
└── workers/
    ├── refund.worker.ts
    ├── notification.worker.ts
    └── webhook.worker.ts
```

## Local Development

Install dependencies:

```bash
npm install
```

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

## Testing Stripe Webhooks

Forward Stripe events to the local application:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Trigger a test refund event:

```bash
stripe trigger charge.refunded
```

## Testing Requirements

The Refund module should include tests for:

- Full refunds
- Partial refunds
- Multiple partial refunds
- Refund amount validation
- Duplicate refund prevention
- Unauthorized refund requests
- Seller approval and rejection
- Stripe API failures
- Webhook retries
- Duplicate webhook delivery
- Seller balance adjustments
- Negative seller balances
- Payout reserve calculations
- Order status updates
- Concurrent refund requests

## Development Roadmap

### Phase 1 — Basic Refunds

- Add refund database models
- Create customer refund request form
- Validate refundable amounts
- Integrate Stripe Refunds
- Add refund status tracking
- Handle Stripe refund webhooks

### Phase 2 — Refund Review

- Add seller refund dashboard
- Add admin refund dashboard
- Implement approval and rejection
- Add refund evidence uploads
- Add customer and seller notifications

### Phase 3 — Financial Adjustments

- Add seller balance deductions
- Add platform fee adjustments
- Add transfer reversals
- Add payout reserves
- Add immutable refund ledger entries

### Phase 4 — Production Readiness

- Add refund retry workers
- Add audit logging
- Add monitoring and alerts
- Add fraud and abuse controls
- Add reconciliation reports
- Add automated integration tests

## Important Design Principles

The frontend should never directly determine whether a refund is valid.

All refund amounts, payment statuses, order ownership, seller balances, and refund eligibility rules must be validated by the backend.

Frontend success pages must not be treated as confirmation that a refund succeeded.

Stripe webhooks should be treated as the trusted source for final asynchronous refund status updates.

Every financial change should be represented by an immutable ledger entry.

## License

This project is intended for educational and demonstration purposes.
