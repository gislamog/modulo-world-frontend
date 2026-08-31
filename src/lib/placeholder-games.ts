// Placeholder entries for games that are planned but not built.
//
// These are not registry rows: they never come from the backend, and none
// of them is playable. They exist so the shell can be designed and judged
// against a realistic amount of content rather than against the single
// game that happens to be finished. Each one carries the slug it will use
// when it becomes a real row, so promoting a game is a delete here plus a
// published row -- no rename, no broken links elsewhere.

import type { Game } from './game-types';

/** A game that has no row yet, shown in the nav and as an empty-state card. */
export interface PlaceholderGame extends Game {
	/** How it is grouped in the sidebar. */
	category: 'Algorithms' | 'Mathematics' | 'Music';
	/** Marks it unplayable, so nothing links to a route that would 404. */
	placeholder: true;
}

function placeholder(
	slug: string,
	title: string,
	description: string,
	category: PlaceholderGame['category'],
	inputRequirement: Game['inputRequirement'] = 'TOUCH_OK'
): PlaceholderGame {
	return {
		// A stable synthetic id, so {#each} keying works the same as it does
		// for registry rows. Prefixed rather than a UUID to make it obvious
		// in a debugger that this did not come from the database.
		id: `placeholder:${slug}`,
		slug,
		title,
		description,
		inputRequirement,
		category,
		placeholder: true
	};
}

export const PLACEHOLDER_GAMES: PlaceholderGame[] = [
	placeholder(
		'sierpinski-triangle',
		'Sierpinski Triangle',
		'Draw a fractal by picking corners at random.',
		'Mathematics'
	),
	placeholder(
		'collatz-climb',
		'Collatz Climb',
		'Halve it or triple it, and watch every number fall to one.',
		'Mathematics'
	),
	placeholder(
		'modular-clock',
		'Modular Clock',
		'Wrap numbers around a circle and find the patterns that repeat.',
		'Mathematics'
	),
	placeholder(
		'prime-sieve',
		'Prime Sieve',
		'Strike out the multiples and see what survives.',
		'Mathematics'
	),
	placeholder(
		'sorting-race',
		'Sorting Race',
		'Run quicksort against bubble sort and watch the gap open.',
		'Algorithms'
	),
	placeholder(
		'maze-solver',
		'Maze Solver',
		'Breadth-first or depth-first: choose the frontier and follow it.',
		'Algorithms',
		'MOUSE_REQUIRED'
	),
	placeholder(
		'path-finder',
		'Path Finder',
		'Weight the tiles and let A* argue with Dijkstra.',
		'Algorithms',
		'MOUSE_REQUIRED'
	),
	placeholder(
		'huffman-builder',
		'Huffman Builder',
		'Merge the rarest letters until the whole message fits in fewer bits.',
		'Algorithms'
	),
	placeholder(
		'rhythm-lattice',
		'Rhythm Lattice',
		'Layer a 3-beat over a 4-beat and hear the cycle close.',
		'Music'
	),
	placeholder(
		'euclidean-beats',
		'Euclidean Beats',
		'Spread hits as evenly as possible and land on a real groove.',
		'Music'
	),
	placeholder(
		'chord-lab',
		'Chord Lab',
		'Stack thirds, count semitones, and name what you built.',
		'Music',
		'KEYBOARD_REQUIRED'
	)
];

/** The categories in display order, each with its games. */
export function placeholdersByCategory(): {
	category: PlaceholderGame['category'];
	games: PlaceholderGame[];
}[] {
	const order: PlaceholderGame['category'][] = ['Algorithms', 'Mathematics', 'Music'];

	return order
		.map((category) => ({
			category,
			games: PLACEHOLDER_GAMES.filter((game) => game.category === category)
		}))
		.filter((group) => group.games.length > 0);
}
