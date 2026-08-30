import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchGame } from '$lib/games';
import { internalApiTarget } from '$lib/api-target.server';

// One dynamic route resolves every registered game (#19). Adding a game
// means a published row and a component, not a new route.
//
// A server load rather than a universal one: resolving the API target
// reads private env, which only server-only modules may import.
export const load: PageServerLoad = async ({ fetch, params }) => {
	const game = await fetchGame(fetch, params.slug, internalApiTarget());

	// Unpublished and nonexistent are the same 404 here, matching the
	// backend. Distinguishing them would confirm which unreleased games
	// exist.
	if (!game) {
		error(404, 'Game not found');
	}

	return { game };
};
