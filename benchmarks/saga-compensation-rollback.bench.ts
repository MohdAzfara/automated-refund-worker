/**
 * Micro-benchmark: Distributed Refund Saga State Transition & Compensation Evaluation
 */
function evaluateSagaTransitionFast(
  outcome: 'SETTLED' | 'TERMINAL_REJECT' | 'TIMEOUT'
): { nextState: string; compensateVendor: boolean } {
  if (outcome === 'SETTLED') {
    return { nextState: 'PSP_REFUND_SETTLED', compensateVendor: false };
  }
  if (outcome === 'TERMINAL_REJECT') {
    return { nextState: 'COMPENSATING_VENDOR_CREDIT', compensateVendor: true };
  }
  return { nextState: 'DLQ_QUARANTINED', compensateVendor: false };
}

function runSagaBenchmark(iterations = 500_000): void {
  const startMs = Date.now();
  let compensations = 0;

  for (let i = 0; i < iterations; i++) {
    const outcome =
      i % 10 === 0 ? 'TERMINAL_REJECT' : i % 15 === 0 ? 'TIMEOUT' : 'SETTLED';
    const res = evaluateSagaTransitionFast(outcome);
    if (res.compensateVendor) {
      compensations += 1;
    }
  }

  const durationMs = Math.max(1, Date.now() - startMs);
  const opsPerSec = Math.round((iterations / durationMs) * 1000);

  console.info(`[Benchmark] Refund Saga Compensation & Transition Evaluation:`);
  console.info(`  Iterations : ${iterations.toLocaleString()} (Compensations: ${compensations.toLocaleString()})`);
  console.info(`  Duration   : ${durationMs} ms`);
  console.info(`  Throughput : ${opsPerSec.toLocaleString()} transitions/sec`);
}

runSagaBenchmark();
