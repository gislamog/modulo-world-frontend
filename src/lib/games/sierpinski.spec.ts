import { describe, it, expect } from 'vitest';
import { isInside, midpoint, step, vertices, type Point } from './sierpinski';

const SIZE = 420;
const corners = vertices(SIZE);

describe('midpoint', () => {
	it('lands half way between two points', () => {
		expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
	});

	it('is the point itself when both are the same', () => {
		expect(midpoint({ x: 3, y: 4 }, { x: 3, y: 4 })).toEqual({ x: 3, y: 4 });
	});
});

describe('vertices', () => {
	it('insets the corners so drawn points are not clipped', () => {
		for (const v of corners) {
			expect(v.x).toBeGreaterThan(0);
			expect(v.y).toBeGreaterThan(0);
			expect(v.x).toBeLessThan(SIZE);
			expect(v.y).toBeLessThan(SIZE);
		}
	});

	it('puts the apex above the base', () => {
		const [apex, left, right] = corners;

		expect(apex.y).toBeLessThan(left.y);
		expect(left.y).toBe(right.y);
	});
});

describe('step', () => {
	it('picks the vertex the random source selects', () => {
		// 0.9 * 3 = 2.7, floored to the third vertex.
		expect(step({ x: 0, y: 0 }, corners, () => 0.9).vertexIndex).toBe(2);
		expect(step({ x: 0, y: 0 }, corners, () => 0).vertexIndex).toBe(0);
	});

	it('never overruns the vertex list when random returns 1', () => {
		// Math.random is [0, 1), but a stub or a rounding edge could hand
		// back exactly 1 and index past the end.
		const { vertexIndex, point } = step({ x: 0, y: 0 }, corners, () => 1);

		expect(vertexIndex).toBe(2);
		expect(point).toEqual(midpoint({ x: 0, y: 0 }, corners[2]));
	});

	it('moves half way to the chosen corner', () => {
		const from: Point = { x: 100, y: 100 };
		const { point } = step(from, corners, () => 0);

		expect(point).toEqual(midpoint(from, corners[0]));
	});
});

describe('the chaos game', () => {
	it('draws an outside starting point into the triangle', () => {
		// The property the whole demo rests on: the first click can land
		// anywhere, and the walk still converges onto the figure.
		let current: Point = { x: 5, y: 5 };
		expect(isInside(current, corners)).toBe(false);

		for (let i = 0; i < 40; i += 1) {
			current = step(current, corners).point;
		}

		expect(isInside(current, corners)).toBe(true);
	});

	it('stays inside once it is inside', () => {
		let current: Point = midpoint(corners[0], corners[1]);

		for (let i = 0; i < 200; i += 1) {
			current = step(current, corners).point;
			expect(isInside(current, corners)).toBe(true);
		}
	});

	it('reaches all three corners over a long run', () => {
		// A walk that only ever picked one vertex would collapse to a
		// point rather than fill the fractal.
		let current: Point = { x: SIZE / 2, y: SIZE / 2 };
		const seen = new Set<number>();

		for (let i = 0; i < 300; i += 1) {
			const result = step(current, corners);
			seen.add(result.vertexIndex);
			current = result.point;
		}

		expect(seen.size).toBe(3);
	});
});

describe('isInside', () => {
	it('accepts a corner', () => {
		expect(isInside(corners[0], corners)).toBe(true);
	});

	it('accepts the centroid', () => {
		const centroid = {
			x: (corners[0].x + corners[1].x + corners[2].x) / 3,
			y: (corners[0].y + corners[1].y + corners[2].y) / 3
		};

		expect(isInside(centroid, corners)).toBe(true);
	});

	it('rejects a point outside', () => {
		expect(isInside({ x: 0, y: 0 }, corners)).toBe(false);
	});
});
