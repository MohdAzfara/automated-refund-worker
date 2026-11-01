/**
 * Recursive PAN, IBAN & Customer PII Telemetry Redactor
 * Ensures PCI-DSS and GDPR compliance across background refund worker logs.
 */
export class RefundPiiRedactor {
  private static readonly SENSITIVE_FIELDS = new Set([
    'pan',
    'cardnumber',
    'iban',
    'accountnumber',
    'customeremail',
    'webhooksecret',
    'cvv'
  ]);

  public static maskSensitiveValue(raw: string): string {
    const clean = raw.replace(/\s+/g, '');
    if (clean.length <= 4) {
      return '****';
    }
    return `****-REDACTED-${clean.slice(-4)}`;
  }

  public static sanitizeLogPayload(record: Record<string, unknown>): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      const normalized = key.toLowerCase().replace(/[_-]/g, '');

      if (this.SENSITIVE_FIELDS.has(normalized) && typeof value === 'string') {
        output[key] = this.maskSensitiveValue(value);
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        output[key] = this.sanitizeLogPayload(value as Record<string, unknown>);
      } else {
        output[key] = value;
      }
    }

    return output;
  }
}
