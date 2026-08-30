import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import GameCard from './GameCard.svelte';
import type { Game } from '$lib/game-types';

function makeGame(overrides: Partial<Game> = {}): Game {
	return {
		id: '00000000-0000-0000-0000-000000000001',
		slug: 'sierpinski',
		title: 'Sierpinski',
		description: 'Draw a triangle by chaos.',
		inputRequirement: 'TOUCH_OK',
		...overrides
	};
}

describe('GameCard', () => {
	it('renders the title and description', () => {
		render(GameCard, { props: { game: makeGame() } });

		const card = screen.getByTestId('game-card');
		expect(card.textContent).toContain('Sierpinski');
		expect(card.textContent).toContain('Draw a triangle by chaos.');
	});

	it('links to the game by slug', () => {
		render(GameCard, { props: { game: makeGame() } });

		const link = screen.getByRole('link');
		expect(link.getAttribute('href')).toBe('/games/sierpinski');
	});

	it('renders without a description', () => {
		render(GameCard, { props: { game: makeGame({ description: null }) } });

		// description is nullable in the registry, so a game without one is
		// a normal row rather than a broken card.
		expect(screen.getByTestId('game-card').textContent).toContain('Sierpinski');
	});

	it('warns when the game needs a keyboard', () => {
		render(GameCard, { props: { game: makeGame({ inputRequirement: 'KEYBOARD_REQUIRED' }) } });

		expect(screen.getByTestId('game-card').textContent).toContain('Needs a keyboard');
	});

	it('says nothing about input when the game works on touch', () => {
		render(GameCard, { props: { game: makeGame({ inputRequirement: 'TOUCH_OK' }) } });

		expect(screen.getByTestId('game-card').textContent).not.toContain('Needs');
	});

	it('exposes exactly one tab stop per card', () => {
		render(GameCard, { props: { game: makeGame() } });

		// The whole card is one link. A separate title link and thumbnail
		// link would make a keyboard visitor tab twice per game (#26).
		expect(screen.getAllByRole('link')).toHaveLength(1);
	});

	it('gives the title a real heading, so the grid has structure', () => {
		render(GameCard, { props: { game: makeGame() } });

		expect(screen.getByRole('heading', { name: 'Sierpinski' })).toBeTruthy();
	});
});
