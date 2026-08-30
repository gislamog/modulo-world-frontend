import { describe, it, expect, vi } from 'vitest';
import { fetchGame, fetchGames, inputWarning, type Game } from './games';

function makeGame(overrides: Partial<Game> = {}): Game {
	return {
		id: '00000000-0000-0000-0000-000000000001',
		slug: 'sierpinski',
		title: 'Sierpinski',
		description: 'Draw a triangle by chaos.',
		inputRequirement: 'MOUSE_REQUIRED',
		...overrides
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

describe('inputWarning', () => {
	it('warns when a game needs a keyboard', () => {
		expect(inputWarning('KEYBOARD_REQUIRED')).toBe('Needs a keyboard');
	});

	it('warns when a game needs a mouse', () => {
		expect(inputWarning('MOUSE_REQUIRED')).toBe('Needs a mouse');
	});

	it('says nothing when the game works on touch', () => {
		// Silence is the point: a warning on every card would train
		// visitors to ignore it.
		expect(inputWarning('TOUCH_OK')).toBeNull();
	});
});

describe('fetchGames', () => {
	it('returns the published games', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse([makeGame()]));

		const games = await fetchGames(fetch);

		expect(games).toHaveLength(1);
		expect(games[0].slug).toBe('sierpinski');
	});

	it('returns an empty array when nothing is published', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse([]));

		// The homepage renders an empty state from this rather than an error.
		await expect(fetchGames(fetch)).resolves.toEqual([]);
	});

	it('throws when the API fails', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse({}, 500));

		// A failed list is a real error. Swallowing it would render the
		// empty state and tell the visitor there are no games.
		await expect(fetchGames(fetch)).rejects.toThrow('500');
	});
});

describe('fetchGame', () => {
	it('returns the game when the slug resolves', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse(makeGame()));

		const game = await fetchGame(fetch, 'sierpinski');

		expect(game?.title).toBe('Sierpinski');
	});

	it('returns null on 404 rather than throwing', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse({}, 404));

		// Unpublished and nonexistent arrive identically, and the caller
		// turns both into the same 404 page.
		await expect(fetchGame(fetch, 'unreleased')).resolves.toBeNull();
	});

	it('throws on a server error, which is not a missing game', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse({}, 500));

		await expect(fetchGame(fetch, 'sierpinski')).rejects.toThrow('500');
	});

	it('encodes the slug into the path', async () => {
		const fetch = vi.fn().mockResolvedValue(jsonResponse(makeGame()));

		await fetchGame(fetch, 'a/b');

		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('a%2Fb'));
	});
});

// The SSR path inside Docker. A relative URL cannot be resolved from the
// frontend container -- it would point at the published origin, which
// there is the frontend itself -- so the server calls the API container
// directly, with the platform fetch, since SvelteKit's enforces CORS on a
// cross-origin call.
//
// Both of those went wrong in turn and each returned a 500 on every page.
// The target arrives as an argument from a server-only module, because
// reading it here would mean importing private env into a file the
// browser can reach -- which SvelteKit refuses to build.
describe('the internal server-side path', () => {
	it('calls the API container by an absolute URL', async () => {
		const call = vi.fn().mockResolvedValue(jsonResponse([makeGame()]));

		await fetchGames(vi.fn(), { base: 'http://api:3000/api', call });

		expect(call).toHaveBeenCalledWith('http://api:3000/api/games');
	});

	it("uses the target's fetch, not the one SvelteKit supplied", async () => {
		const call = vi.fn().mockResolvedValue(jsonResponse([makeGame()]));
		const kitFetch = vi.fn();

		await fetchGames(kitFetch, { base: 'http://api:3000/api', call });

		// SvelteKit's fetch would fail CORS on that origin.
		expect(kitFetch).not.toHaveBeenCalled();
	});

	it('encodes the slug on the internal path too', async () => {
		const call = vi.fn().mockResolvedValue(jsonResponse(makeGame()));

		await fetchGame(vi.fn(), 'a/b', { base: 'http://api:3000/api', call });

		expect(call).toHaveBeenCalledWith('http://api:3000/api/games/a%2Fb');
	});

	it('falls back to the same-origin path when there is no target', async () => {
		const kitFetch = vi.fn().mockResolvedValue(jsonResponse([]));

		// Null is what the server module returns when API_INTERNAL_URL is
		// unset, and what the browser always passes.
		await fetchGames(kitFetch, null);

		expect(kitFetch).toHaveBeenCalledWith('/api/games');
	});
});
