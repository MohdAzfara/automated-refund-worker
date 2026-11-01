/**
 * Micro-benchmark: Deterministic FNV-1a / 64-bit Payload Fingerprinting for Refund Jobs
 * Ensures rapid conflict detection on duplicate Idempotency-Key submissions.
 */
function computeDeterministicFingerprint(input: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, '0');
}

function runFingerprintBenchmark(iterations = 200_000): void {
  const startMs = Date.now();
  let lastDigest = '';

  for (let i = 0; i < iterations; i++) {
    lastDigest = computeDeterministicFingerprint(
      `cap_${i}:vendor_991:refund_${(i % 500) * 100}:curr_USD`
    );
  }

  const durationMs = Math.max(1, Date.now() - startMs);
  const opsPerSec = Math.round((iterations / durationMs) * 1000);

  console.info(`[Benchmark] Refund Idempotency Payload Fingerprinting:`);
  console.info(`  Iterations : ${iterations.toLocaleString()} (Sample: ${lastDigest})`);
  console.info(`  Duration   : ${durationMs} ms`);
  console.info(`  Throughput : ${opsPerSec.toLocaleString()} fingerprints/sec`);
}

runFingerprintBenchmark();
