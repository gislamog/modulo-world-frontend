import { describe, it, expect } from 'vitest';
import { gameComponent, playableSlugs } from './game-component';

// The lookup is what makes "a row plus a component" true (#19): the file
// name is the slug, and nothing else has to be edited to add a game.
describe('gameComponent', () => {
	it('finds a game by its slug', () => {
		expect(gameComponent('sierpinski-triangle')).toBeTruthy();
	});

	it('returns null for a registered game with no component yet', () => {
		// A normal state, not an error: the row can exist before the game
		// is written, and the route renders a placeholder.
		expect(gameComponent('not-written-yet')).toBeNull();
	});

	it('returns null rather than throwing on a slug that escapes the directory', () => {
		expect(gameComponent('../games/sierpinski-triangle')).toBeNull();
		expect(gameComponent('')).toBeNull();
	});
});

describe('playableSlugs', () => {
	it('lists the slug of every component in the directory', () => {
		expect(playableSlugs()).toContain('sierpinski-triangle');
	});

	it('strips the path and extension, leaving the slug alone', () => {
		for (const slug of playableSlugs()) {
			expect(slug).not.toContain('/');
			expect(slug).not.toContain('.svelte');
		}
	});
});
