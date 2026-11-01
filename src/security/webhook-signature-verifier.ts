/**
 * Zero-Trust Refund Webhook Signature & Replay Window Guard
 * Protects asynchronous acquirer settlement callbacks against spoofing and timing attacks.
 */
export class RefundWebhookSignatureVerifier {
  constructor(private readonly maxClockSkewSec = 300) {}

  public isTimestampFresh(
    webhookTimestampSec: number,
    nowSec = Math.floor(Date.now() / 1000)
  ): boolean {
    return Math.abs(nowSec - webhookTimestampSec) <= this.maxClockSkewSec;
  }

  public constantTimeCompareHex(expectedSignatureHex: string, receivedSignatureHex: string): boolean {
    if (
      expectedSignatureHex.length === 0 ||
      expectedSignatureHex.length !== receivedSignatureHex.length
    ) {
      return false;
    }

    let accumulator = 0;
    for (let i = 0; i < expectedSignatureHex.length; i++) {
      accumulator |=
        expectedSignatureHex.charCodeAt(i) ^ receivedSignatureHex.charCodeAt(i);
    }
    return accumulator === 0;
  }
}
