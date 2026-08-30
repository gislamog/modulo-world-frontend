// The chaos game, which is all Sierpinski's triangle really is.
//
// Kept apart from the component so the arithmetic can be tested without a
// canvas: the interesting claim -- that midpoints of random vertices
// converge on the triangle -- is about numbers, not pixels.

export interface Point {
	x: number;
	y: number;
}

/** One step of the walk, with the vertex that produced it. */
export interface Step {
	point: Point;
	vertexIndex: number;
}

/**
 * The three corners, inset from the edges so the drawn dots are not
 * clipped at the canvas boundary.
 */
export function vertices(size: number): [Point, Point, Point] {
	const inset = size * 0.0667;

	return [
		{ x: size / 2, y: inset },
		{ x: inset, y: size - inset },
		{ x: size - inset, y: size - inset }
	];
}

/** The midpoint of two points. The whole rule of the game. */
export function midpoint(a: Point, b: Point): Point {
	return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * One step: pick a vertex at random, move half way to it.
 *
 * The random source is a parameter so tests can make the walk
 * deterministic. Math.random by default, which is what the game uses.
 */
export function step(
	from: Point,
	corners: readonly Point[],
	random: () => number = Math.random
): Step {
	const vertexIndex = Math.min(corners.length - 1, Math.floor(random() * corners.length));

	return { point: midpoint(from, corners[vertexIndex]), vertexIndex };
}

/**
 * Whether a point lies inside the triangle, by barycentric sign test.
 *
 * Used by the tests to state the property that matters: wherever the
 * first click lands, the walk is drawn into the triangle and stays there.
 */
export function isInside(p: Point, corners: readonly Point[]): boolean {
	const [a, b, c] = corners;

	const sign = (p1: Point, p2: Point, p3: Point) =>
		(p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

	const d1 = sign(p, a, b);
	const d2 = sign(p, b, c);
	const d3 = sign(p, c, a);

	const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
	const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

	// Inside means all three cross products share a sign; a point on an
	// edge gives zero and counts as inside.
	return !(hasNegative && hasPositive);
}
