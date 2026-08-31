import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import GameCard from './GameCard.svelte';
import type { Game } from '$lib/game-types';

beforeAll(() => {
	// jsdom implements no playback, so play() is undefined and the card's
	// call would throw rather than resolve. Resolved, because the card
	// treats a rejection as "autoplay was refused" and hides the video.
	HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
});

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

	it('does not link an unavailable game', () => {
		render(GameCard, { props: { game: makeGame(), unavailable: true } });

		// The route would 404, so the card is not a link at all rather than
		// a link that fails.
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.getByTestId('game-card').textContent).toContain('Coming soon');
	});

	it('shows the tile artwork for the game', () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		const poster = container.querySelector('img.poster');
		expect(poster?.getAttribute('src')).toBe('/games/sierpinski/poster.webp');
	});

	it('leaves the artwork out of the accessible name', () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		// The caption below the image already names the game. Alt text here
		// would have a screen reader announce the title twice (#26).
		expect(container.querySelector('img.poster')?.getAttribute('alt')).toBe('');
	});

	it('does not mount the preview video until the tile is pointed at', () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		// Eleven tiles mounting eleven videos on load would have the browser
		// fetching loops nobody asked to see.
		expect(container.querySelector('video')).toBeNull();
	});

	it('plays the preview on hover', async () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		await fireEvent.mouseEnter(screen.getByRole('link'));

		const video = await waitFor(() => {
			const found = container.querySelector('video');
			expect(found).not.toBeNull();
			return found!;
		});

		// muted and playsinline are what make autoplay permitted at all;
		// without them iOS opens the video fullscreen instead.
		expect(video.muted).toBe(true);
		expect(video.hasAttribute('playsinline')).toBe(true);
		expect(video.hasAttribute('loop')).toBe(true);
	});

	it('plays the preview on focus too', async () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		// Reaching the tile by keyboard has to show what reaching it by
		// mouse shows, or the preview is mouse-only (#26).
		await fireEvent.focusIn(screen.getByRole('link'));

		await waitFor(() => expect(container.querySelector('video')).not.toBeNull());
	});

	it('stops the preview when the pointer leaves', async () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		const link = screen.getByRole('link');
		await fireEvent.mouseEnter(link);
		await waitFor(() => expect(container.querySelector('video')).not.toBeNull());

		await fireEvent.mouseLeave(link);
		await waitFor(() => expect(container.querySelector('video')).toBeNull());
	});

	it('keeps the preview out of the accessibility tree', async () => {
		const { container } = render(GameCard, { props: { game: makeGame() } });

		await fireEvent.mouseEnter(screen.getByRole('link'));

		// A decorative loop with no captions and nothing to scrub. It must
		// not become a second tab stop inside the card (#26).
		const video = await waitFor(() => container.querySelector('video')!);
		expect(video.getAttribute('aria-hidden')).toBe('true');
		expect(video.getAttribute('tabindex')).toBe('-1');
	});

	it('never previews an unavailable game', async () => {
		const { container } = render(GameCard, {
			props: { game: makeGame(), unavailable: true }
		});

		// There is no game to show a loop of, and the tile is not a link.
		await fireEvent.mouseEnter(container.querySelector('article > div')!);
		expect(container.querySelector('video')).toBeNull();
	});

	it('prefers "coming soon" over an input warning when unavailable', () => {
		render(GameCard, {
			props: { game: makeGame({ inputRequirement: 'KEYBOARD_REQUIRED' }), unavailable: true }
		});

		// What hardware it will need does not matter yet, and two notices
		// on one card is noise.
		const card = screen.getByTestId('game-card');
		expect(card.textContent).toContain('Coming soon');
		expect(card.textContent).not.toContain('Needs a keyboard');
	});
});
