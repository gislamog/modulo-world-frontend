// Where a game's tile artwork lives.
//
// By convention rather than by database column: the Game model has no
// media fields, and adding two nullable string columns to carry a path
// that is always the same shape would be a migration to store a fact the
// slug already implies. A game's art is:
//
//   static/games/<slug>/poster.webp    the still, shown at rest
//   static/games/<slug>/preview.webm   the loop, played on hover
//   static/games/<slug>/preview.mp4    the same loop for Safari
//
// Drop the files in and the tile picks them up. Leave them out and the
// tile falls back to a generated cover, so a game without art is a plainer
// tile rather than a broken image. If art ever needs to vary per row --
// seasonal covers, say -- this becomes a column and the callers keep
// working, because they ask this module rather than building paths.

/** A tile's still image and, when one exists, its hover loop. */
export interface GameMedia {
	/** Tried in order; the tile falls to the next when one fails to load,
	 *  and to the generated cover when all of them do. */
	posters: string[];
	/** Source list for the hover video, widest support first. */
	sources: { src: string; type: string }[];
}

const ROOT = '/games';

export function gameMedia(slug: string): GameMedia {
	const base = `${ROOT}/${encodeURIComponent(slug)}`;

	return {
		// WebP is what finished art ships as. The SVG behind it is the
		// stand-in cover checked into static/, so a game with no photograph
		// yet still gets a tile rather than the bare gradient.
		posters: [`${base}/poster.webp`, `${base}/poster.svg`],
		// WebM first: smaller at the same quality, and the browsers that
		// cannot play it read past it to the MP4 without a second request.
		sources: [
			{ src: `${base}/preview.webm`, type: 'video/webm' },
			{ src: `${base}/preview.mp4`, type: 'video/mp4' }
		]
	};
}

/**
 * A stable hue for a slug, used by the fallback cover.
 *
 * The same game gets the same colour on every visit and on every machine,
 * which a random hue would not: the tile would change colour on each
 * render, and server and client would disagree during hydration.
 */
export function coverHue(slug: string): number {
	let hash = 0;

	for (let i = 0; i < slug.length; i += 1) {
		// A small odd multiplier and a 32-bit wrap. Not a strong hash, and
		// it does not need to be -- it only has to scatter a dozen slugs
		// across the wheel and give the same answer twice.
		hash = (hash * 31 + slug.charCodeAt(i)) | 0;
	}

	return Math.abs(hash) % 360;
}
