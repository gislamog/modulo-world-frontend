import type { PageLoad } from './$types';
import { fetchGames } from '$lib/games';

// The homepage renders from the registry rather than a hardcoded list
// (#19): a new game appears here as soon as its row is published, with no
// edit to this file.
export const load: PageLoad = async ({ fetch }) => {
	return { games: await fetchGames(fetch) };
};
