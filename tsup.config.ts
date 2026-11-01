export interface TsupBuildConfig {
  readonly entry: readonly string[];
  readonly format: readonly ('cjs' | 'esm')[];
  readonly dts: boolean;
  readonly splitting: boolean;
  readonly sourcemap: boolean;
  readonly clean: boolean;
  readonly minify: boolean;
  readonly target: 'node20';
  readonly outDir: string;
}

const buildConfig: TsupBuildConfig = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node20',
  outDir: 'dist'
};

export default buildConfig;
