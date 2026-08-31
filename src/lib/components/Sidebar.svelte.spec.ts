import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';

// $app/state reads from SvelteKit's router, which is not running under
// vitest. The sidebar only needs the current URL and the playable slugs,
// so those are what the stub provides.
vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost/games/sierpinski-triangle'),
		data: { playableSlugs: ['sierpinski-triangle'] }
	}
}));

import Sidebar from './Sidebar.svelte';
import { PLACEHOLDER_GAMES } from '$lib/placeholder-games';

describe('Sidebar', () => {
	it('is a landmark, so it can be reached without tabbing to it', () => {
		render(Sidebar);

		expect(screen.getByRole('navigation', { name: 'Games' })).toBeTruthy();
	});

	it('links back to the full list', () => {
		render(Sidebar);

		expect(screen.getByRole('link', { name: 'All games' }).getAttribute('href')).toBe('/');
	});

	it('lists every game', () => {
		render(Sidebar);

		const nav = screen.getByRole('navigation', { name: 'Games' });
		for (const game of PLACEHOLDER_GAMES) {
			expect(within(nav).getByText(game.title)).toBeTruthy();
		}
	});

	it('groups the games under headings', () => {
		render(Sidebar);

		// Structure, not decoration: a screen reader uses these to skip
		// between sections (#26).
		expect(screen.getByRole('heading', { name: 'Algorithms' })).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Mathematics' })).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Music' })).toBeTruthy();
	});

	it('links the game that has a component', () => {
		render(Sidebar);

		expect(screen.getByRole('link', { name: 'Sierpinski Triangle' }).getAttribute('href')).toBe(
			'/games/sierpinski-triangle'
		);
	});

	it('marks the game being viewed as the current page', () => {
		render(Sidebar);

		const current = screen.getByRole('link', { name: 'Sierpinski Triangle' });
		expect(current.getAttribute('aria-current')).toBe('page');
	});

	it('does not link a game that has no component', () => {
		render(Sidebar);

		// A link to an unbuilt game is a 404 and a wasted tab stop, so an
		// unfinished game is text rather than an anchor.
		expect(screen.queryByRole('link', { name: /Collatz Climb/ })).toBeNull();
		expect(screen.getByText('Collatz Climb')).toBeTruthy();
	});

	it('says which games are unfinished', () => {
		render(Sidebar);

		// One badge per placeholder: everything except the single playable
		// game in the mocked page data.
		expect(screen.getAllByText('Soon')).toHaveLength(PLACEHOLDER_GAMES.length - 1);
	});

	it('gives every row an icon, so the collapsed rail is not blank', () => {
		render(Sidebar);

		const nav = screen.getByRole('navigation', { name: 'Games' });
		// One row per game plus the "All games" row at the top.
		expect(nav.querySelectorAll('.item svg')).toHaveLength(PLACEHOLDER_GAMES.length + 1);
	});

	it('keeps the titles in the document while the rail is collapsed', () => {
		render(Sidebar);

		// The labels are faded out with opacity rather than removed, so the
		// rail stays readable to a screen reader when it is narrow (#26).
		// Losing that would make the whole nav a row of unnamed icons.
		const nav = screen.getByRole('navigation', { name: 'Games' });
		expect(within(nav).getByText('Rhythm Lattice')).toBeTruthy();
	});
});
