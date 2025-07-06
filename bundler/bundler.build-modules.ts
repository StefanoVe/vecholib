import dts from 'bun-plugin-dts';

await Bun.build({
	entrypoints: ['src/backend/index.ts', 'src/functions/index.ts','src/interfaces/index.ts'],
	outdir: './dist',
	plugins: [dts()],
	target: 'node',
});
