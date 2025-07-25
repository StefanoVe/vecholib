import seedrandom from 'seedrandom';
import Color from './color';

export const generateColorFromSeed = (seed: string) => {
	// Init randomizer
	const random = seedrandom(seed);

	const r = Math.floor(random() * 256);
	const g = Math.floor(random() * 256);
	const b = Math.floor(random() * 256);

	return new Color(r, g, b);
};

Object.defineProperty(generateColorFromSeed, 'default', {
	value: generateColorFromSeed,
});
