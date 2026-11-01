/**
 * Micro-benchmark: AWS-Style Full-Jitter Exponential Backoff for Refund Workers
 * Formula: delay = random_between(0, min(capMs, baseMs * 2 ^ attempt))
 */
function calculateRefundBackoffMs(attempt: number, baseMs = 200, capMs = 30_000): number {
  const exponentialCap = Math.min(capMs, baseMs * Math.pow(2, attempt));
  return Math.floor(Math.random() * exponentialCap);
}

function runBackoffJitterBenchmark(iterations = 500_000): void {
  const startMs = Date.now();
  let totalDelayMs = 0;

  for (let i = 0; i < iterations; i++) {
    totalDelayMs += calculateRefundBackoffMs(i % 7);
  }

  const durationMs = Math.max(1, Date.now() - startMs);
  const opsPerSec = Math.round((iterations / durationMs) * 1000);

  console.info(`[Benchmark] Refund Worker Full-Jitter Backoff Computation:`);
  console.info(`  Iterations : ${iterations.toLocaleString()} (Check: ${totalDelayMs > 0})`);
  console.info(`  Duration   : ${durationMs} ms`);
  console.info(`  Throughput : ${opsPerSec.toLocaleString()} calculations/sec`);
}

runBackoffJitterBenchmark();
