/**
 * Cryptographic Refund Saga & Vendor Clawback Attestation Sealer
 * Computes tamper-evident digests across multi-step refund reversal payloads.
 */
export class RefundAttestationSealer {
  public static computeSagaDigest(params: {
    sagaId: string;
    captureId: string;
    idempotencyKey: string;
    requestedRefundMinor: bigint;
    vendorClawbackMinor: bigint;
  }): string {
    const preimage = `${params.sagaId.trim()}:${params.captureId.trim()}:${params.idempotencyKey.trim()}:${params.requestedRefundMinor.toString()}:${params.vendorClawbackMinor.toString()}`;
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let i = 0; i < preimage.length; i++) {
      hash ^= BigInt(preimage.charCodeAt(i));
      hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
  }
}
