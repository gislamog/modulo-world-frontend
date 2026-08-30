import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env as privateEnv } from '$env/dynamic/private';
import { fetchGame, fetchGames, inputWarning, type Game } from './games';

// $env/dynamic/private is read when the module loads, so mutating
// process.env in a hook is too late to change it. Mocking the module
// gives an object the tests can rewrite between cases.
//
// It matters because these run in Node, where the code cannot tell a test
// from server-side rendering, and the dev container really does set
// API_INTERNAL_URL. Left alone, the same-origin tests below would take
// the internal cross-origin path and never call the fetch they inject.
vi.mock('$env/dynamic/private', () => ({ env: {} as Record<string, string> }));

beforeEach(() => {
	// Same-origin by default: the browser's path, and what most of these
	// tests are about. The internal path has its own describe below.
	delete (privateEnv as Record<string, string | undefined>).API_INTERNAL_URL;
});

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
// directly. That call is cross-origin, and SvelteKit's fetch enforces
// CORS on it, so it has to use the platform fetch instead.
//
// Both of those went wrong in turn and each returned a 500 on every page.
// These pin the shape of the fix.
describe('the internal server-side path', () => {
	beforeEach(() => {
		(privateEnv as Record<string, string | undefined>).API_INTERNAL_URL = 'http://api:3000';
	});

	it('calls the API container by an absolute URL', async () => {
		const platformFetch = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(jsonResponse([makeGame()]));

		await fetchGames(vi.fn());

		expect(platformFetch).toHaveBeenCalledWith('http://api:3000/api/games');

		platformFetch.mockRestore();
	});

	it("bypasses SvelteKit's fetch, which would fail CORS on that origin", async () => {
		const platformFetch = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(jsonResponse([makeGame()]));
		const kitFetch = vi.fn();

		await fetchGames(kitFetch);

		expect(kitFetch).not.toHaveBeenCalled();

		platformFetch.mockRestore();
	});

	it('keeps the same-origin path on the caller fetch', async () => {
		delete (privateEnv as Record<string, string | undefined>).API_INTERNAL_URL;
		const kitFetch = vi.fn().mockResolvedValue(jsonResponse([]));

		await fetchGames(kitFetch);

		// Relative, and through the fetch SvelteKit supplies: the browser
		// gets cookie-aware requests and an inlined response.
		expect(kitFetch).toHaveBeenCalledWith('/api/games');
	});
});
