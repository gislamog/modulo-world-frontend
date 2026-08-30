// Fetching the game registry (#19).
//
// The types and the display helpers live in ./game-types, deliberately
// apart from this file: importing $env/dynamic/public pulls request-time
// configuration in, and a presentational component that only needs to
// label a card should not drag that along.

import { env } from '$env/dynamic/public';
import type { ApiTarget } from './api-target.server';
import type { Game } from './game-types';

export type { Game, InputRequirement } from './game-types';
export { inputWarning } from './game-types';

/**
 * Resolved at request time rather than build time.
 *
 * The container image is built once and runs in dev and production, so an
 * origin baked in at build would be wrong in one of them. Requests are
 * proxied through Nginx on the same origin, so this is a path.
 */
function apiBase(): string {
	return env.PUBLIC_API_BASE_URL || '/api';
}

/**
 * Where to send the call, and what to send it with.
 *
 * The default is the relative path through Nginx and the caller's fetch:
 * correct in the browser, and what the tests inject.
 *
 * Server-side rendering inside Docker cannot use that path and passes an
 * explicit target instead. It comes from a server-only module rather than
 * being read here, because $env/dynamic/private may not be imported by
 * anything the browser can reach -- and a universal load module reaches
 * this file from both sides.
 */
function resolveTarget(fetch: typeof globalThis.fetch, target?: ApiTarget | null): ApiTarget {
	return target ?? { base: apiBase(), call: fetch };
}

/**
 * Every published game.
 *
 * Takes SvelteKit's fetch so that in the browser the call is
 * credential-aware and its result is inlined into the page, sparing a
 * second request on hydration.
 */
export async function fetchGames(
	fetch: typeof globalThis.fetch,
	target?: ApiTarget | null
): Promise<Game[]> {
	const { base, call } = resolveTarget(fetch, target);
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
	slug: string,
	target?: ApiTarget | null
): Promise<Game | null> {
	const { base, call } = resolveTarget(fetch, target);
	const response = await call(`${base}/games/${encodeURIComponent(slug)}`);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`The game request failed with ${response.status}.`);
	}

	return response.json() as Promise<Game>;
}
