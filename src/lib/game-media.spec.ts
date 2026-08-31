import { describe, it, expect } from 'vitest';
import { coverHue, gameMedia } from './game-media';

describe('gameMedia', () => {
	it('derives the poster candidates from the slug', () => {
		const media = gameMedia('prime-sieve');

		// WebP first, so finished art wins over the checked-in stand-in.
		expect(media.posters).toEqual([
			'/games/prime-sieve/poster.webp',
			'/games/prime-sieve/poster.svg'
		]);
	});

	it('offers WebM before MP4', () => {
		// Smaller at the same quality; a browser that cannot play it reads
		// past to the MP4 without spending a request on the first.
		expect(gameMedia('maze-solver').sources.map((source) => source.type)).toEqual([
			'video/webm',
			'video/mp4'
		]);
	});

	it('escapes a slug that would otherwise break the path', () => {
		// Slugs come from the database, not from this file, so the path is
		// built rather than trusted.
		expect(gameMedia('a b/c').posters[0]).toBe('/games/a%20b%2Fc/poster.webp');
	});
});

describe('coverHue', () => {
	it('gives the same slug the same hue every time', () => {
		// Server and client both render the tile. A random hue would have
		// them disagree, and hydration would repaint every card.
		expect(coverHue('chord-lab')).toBe(coverHue('chord-lab'));
	});

	it('stays inside the colour wheel', () => {
		for (const slug of ['a', 'sorting-race', 'zzzzzzzzzzzzzzzzzzzz', '']) {
			const hue = coverHue(slug);
			expect(hue).toBeGreaterThanOrEqual(0);
			expect(hue).toBeLessThan(360);
		}
	});

	it('scatters the real slugs rather than clustering them', () => {
		// A hash that returned one value would make every tile the same
		// colour, which is the failure this guards.
		const hues = ['sorting-race', 'maze-solver', 'prime-sieve', 'chord-lab'].map(coverHue);
		expect(new Set(hues).size).toBe(hues.length);
	});
});
