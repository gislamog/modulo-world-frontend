// Icon path data for the collapsed nav rail.
//
// Kept out of placeholder-games.ts because that file is the catalogue and
// this is presentation: a registry row arriving from the backend has no
// icon field, and it still has to draw something in the rail.
//
// One 24x24 grid, stroked with currentColor, so every glyph carries the
// same weight and inherits the link's colour without a rule per icon.

/** A glyph per category, plus the fallback for anything unrecognised. */
const CATEGORY_ICONS: Record<string, string> = {
	// A triangle: the recursive shapes and number figures.
	Mathematics: 'M12 4 3 20h18z',
	// Ascending bars: sorting, searching, and the cost of doing it.
	Algorithms: 'M4 20v-6M10 20V8M16 20v-9M22 20V4',
	// A beamed pair of notes.
	Music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
};

/** A grid of squares: the whole catalogue, used for "All games". */
export const ALL_GAMES_ICON = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';

/** A four-pointed star, matching the one in the logo mark. */
const FALLBACK_ICON = 'M12 3 13.8 10.2 21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z';

/**
 * The glyph for a category.
 *
 * Falls back rather than throwing on an unknown one: a game whose category
 * this file has not caught up with should still draw something in the
 * rail, where there is no room for a title to explain its absence.
 */
export function categoryIcon(category: string): string {
	return CATEGORY_ICONS[category] ?? FALLBACK_ICON;
}
