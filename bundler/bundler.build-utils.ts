import dts from 'bun-plugin-dts';

await Bun.build({
	entrypoints: ['src/utils/backend/index.ts', 'src/utils/functions/index.ts'],
	outdir: './dist',
	plugins: [dts()],
	target: 'node',
});
