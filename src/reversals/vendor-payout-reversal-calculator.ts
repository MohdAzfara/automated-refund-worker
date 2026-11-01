export interface SplitCaptureContext {
  readonly originalCapturedMinor: bigint;
  readonly originalVendorPayoutMinor: bigint;
  readonly originalPlatformFeeMinor: bigint;
}

export interface VendorReversalBreakdown {
  readonly requestedRefundMinor: bigint;
  readonly vendorClawbackMinor: bigint;
  readonly platformFeeRefundMinor: bigint;
  readonly conservationVerified: boolean;
}

/**
 * Pro-Rata Connected Vendor Payout Reversal Calculator
 * Synchronizes partial customer refunds with vendor balance clawbacks in payout-gateway-service.
 */
export class VendorPayoutReversalCalculator {
  public computeProRataReversal(
    context: SplitCaptureContext,
    requestedRefundMinor: bigint
  ): VendorReversalBreakdown {
    if (
      context.originalCapturedMinor <= 0n ||
      context.originalVendorPayoutMinor + context.originalPlatformFeeMinor !==
        context.originalCapturedMinor
    ) {
      throw new Error('Invalid split capture context: vendor share + platform fee must equal captured amount.');
    }

    const vendorClawbackMinor =
      (requestedRefundMinor * context.originalVendorPayoutMinor) / context.originalCapturedMinor;
    const platformFeeRefundMinor = requestedRefundMinor - vendorClawbackMinor;

    return {
      requestedRefundMinor,
      vendorClawbackMinor,
      platformFeeRefundMinor,
      conservationVerified:
        vendorClawbackMinor + platformFeeRefundMinor === requestedRefundMinor
    };
  }
}
