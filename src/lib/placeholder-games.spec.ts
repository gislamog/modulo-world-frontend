import { describe, it, expect } from 'vitest';
import { PLACEHOLDER_GAMES, placeholdersByCategory } from './placeholder-games';

describe('placeholder games', () => {
	it('gives every game a unique slug', () => {
		// Slugs become routes and {#each} keys, so a duplicate would render
		// one entry twice and link both to the same place.
		const slugs = PLACEHOLDER_GAMES.map((game) => game.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('gives every game a unique id', () => {
		const ids = PLACEHOLDER_GAMES.map((game) => game.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('marks them all as placeholders', () => {
		// The flag is what stops one being mistaken for a registry row.
		expect(PLACEHOLDER_GAMES.every((game) => game.placeholder)).toBe(true);
	});

	it('describes every game, so no card renders bare', () => {
		expect(PLACEHOLDER_GAMES.every((game) => (game.description ?? '').length > 0)).toBe(true);
	});

	it('places every game in exactly one category group', () => {
		const grouped = placeholdersByCategory().flatMap((group) => group.games);
		expect(grouped).toHaveLength(PLACEHOLDER_GAMES.length);
	});

	it('returns the categories in a fixed order', () => {
		// The sidebar renders these top to bottom, so the order has to be
		// deliberate rather than whatever order the array happens to hold.
		expect(placeholdersByCategory().map((group) => group.category)).toEqual([
			'Algorithms',
			'Mathematics',
			'Music'
		]);
	});
});
