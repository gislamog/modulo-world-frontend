import type { PageServerLoad } from './$types';
import { fetchGames } from '$lib/games';
import { internalApiTarget } from '$lib/api-target.server';

// The homepage renders from the registry rather than a hardcoded list
// (#19): a new game appears here as soon as its row is published, with no
// edit to this file.
//
// A server load rather than a universal one, because resolving the API
// target reads private env, which only server-only modules may import.
// The registry is public, so nothing secret reaches the page -- the
// server merely knows where to ask for it.
export const load: PageServerLoad = async ({ fetch }) => {
	return { games: await fetchGames(fetch, internalApiTarget()) };
};
