export interface JestCoverageThreshold {
  readonly branches: number;
  readonly functions: number;
  readonly lines: number;
  readonly statements: number;
}

export interface RefundWorkerJestConfig {
  readonly displayName: string;
  readonly preset: string;
  readonly testEnvironment: 'node';
  readonly roots: readonly string[];
  readonly testMatch: readonly string[];
  readonly collectCoverageFrom: readonly string[];
  readonly coverageThreshold: {
    readonly global: JestCoverageThreshold;
  };
  readonly verbose: boolean;
  readonly clearMocks: boolean;
  readonly restoreMocks: boolean;
}

const config: RefundWorkerJestConfig = {
  displayName: 'automated-refund-worker',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/errors/**/*.ts',
    'src/fraud/**/*.ts',
    'src/guards/**/*.ts',
    'src/reversals/**/*.ts',
    'src/saga/**/*.ts',
    'src/security/**/*.ts',
    'src/telemetry/**/*.ts',
    'src/workers/**/*.ts',
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};

export default config;
