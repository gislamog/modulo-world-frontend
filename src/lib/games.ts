// Fetching the game registry (#19).
//
// The types and the display helpers live in ./game-types, deliberately
// apart from this file: importing $env/dynamic/public pulls request-time
// configuration in, and a presentational component that only needs to
// label a card should not drag that along.

import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { Game } from './game-types';

export type { Game, InputRequirement } from './game-types';
export { inputWarning } from './game-types';

/**
 * Resolved at request time rather than build time.
 *
 * The container image is built once and runs in dev and production, so an
 * origin baked in at build would be wrong in one of them.
 *
 * The browser and the SSR process need different values. The browser is
 * served through Nginx on a single origin, so a path is correct there.
 * During SSR the same path would resolve against the request's own origin
 * -- localhost:8080 in Docker -- which inside the container is the
 * frontend itself, where nothing serves the API. So the server calls the
 * API container directly by its service name.
 */
function apiBase(): string {
	if (!browser && privateEnv.API_INTERNAL_URL) {
		return `${privateEnv.API_INTERNAL_URL}/api`;
	}

	return env.PUBLIC_API_BASE_URL || '/api';
}

/**
 * The base URL to call, paired with the fetch that may call it.
 *
 * An absolute base means the internal SSR call to the API container,
 * which is cross-origin. SvelteKit's fetch applies browser CORS rules and
 * so rejects it for want of an Access-Control-Allow-Origin header; its
 * benefits -- cookie forwarding and inlining the response into the page
 * -- only apply same-origin anyway, so that call uses the platform fetch.
 *
 * A relative base is same-origin through Nginx and keeps the caller's
 * fetch, which is what the browser wants and what the tests inject.
 */
function apiTarget(fetch: typeof globalThis.fetch): {
	base: string;
	call: typeof globalThis.fetch;
} {
	const base = apiBase();
	const crossOrigin = /^https?:\/\//.test(base);

	return {
		base,
		call: crossOrigin ? globalThis.fetch : fetch
	};
}

/**
 * Every published game.
 *
 * Takes SvelteKit's fetch so that in the browser the call is
 * credential-aware and its result is inlined into the page, sparing a
 * second request on hydration.
 */
export async function fetchGames(fetch: typeof globalThis.fetch): Promise<Game[]> {
	const { base, call } = apiTarget(fetch);
	const response = await call(`${base}/games`);

	if (!response.ok) {
		throw new Error(`The games list request failed with ${response.status}.`);
	}

	return response.json() as Promise<Game[]>;
}

/**
 * One published game, or null when the slug is unknown or unpublished.
 *
 * Null rather than a throw, because the caller turns both into the same
 * 404. The backend already refuses to distinguish the two cases.
 */
export async function fetchGame(
	fetch: typeof globalThis.fetch,
	slug: string
): Promise<Game | null> {
	const { base, call } = apiTarget(fetch);
	const response = await call(`${base}/games/${encodeURIComponent(slug)}`);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`The game request failed with ${response.status}.`);
	}

	return response.json() as Promise<Game>;
}
