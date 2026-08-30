import { describe, it, expect } from 'vitest';
import { formatDuration, formatScore, ordinal } from './format';

describe('formatDuration', () => {
	it('formats under a minute with a zero minute part', () => {
		expect(formatDuration(5_000)).toBe('0:05');
	});

	it('pads seconds to two digits', () => {
		expect(formatDuration(65_000)).toBe('1:05');
	});

	it('switches to h:mm:ss past an hour', () => {
		expect(formatDuration(3_661_000)).toBe('1:01:01');
	});

	it('rounds down, so a time is never shown as better than it was', () => {
		// 59.9s is not a minute. Rounding up would credit a run that did
		// not happen.
		expect(formatDuration(59_900)).toBe('0:59');
	});

	it('falls back to zero for negative and non-finite input', () => {
		expect(formatDuration(-1)).toBe('0:00');
		expect(formatDuration(Number.NaN)).toBe('0:00');
		expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00');
	});
});

describe('formatScore', () => {
	it('separates thousands', () => {
		expect(formatScore(1_234_567)).toBe('1,234,567');
	});

	it('leaves values under a thousand alone', () => {
		expect(formatScore(999)).toBe('999');
	});

	it('truncates fractional scores', () => {
		expect(formatScore(1234.99)).toBe('1,234');
	});

	it('falls back to zero for non-finite input', () => {
		expect(formatScore(Number.NaN)).toBe('0');
	});
});

describe('ordinal', () => {
	it('handles the common suffixes', () => {
		expect(ordinal(1)).toBe('1st');
		expect(ordinal(2)).toBe('2nd');
		expect(ordinal(3)).toBe('3rd');
		expect(ordinal(4)).toBe('4th');
	});

	it('gives the teens th, not st/nd/rd', () => {
		expect(ordinal(11)).toBe('11th');
		expect(ordinal(12)).toBe('12th');
		expect(ordinal(13)).toBe('13th');
	});

	it('applies the teen rule again in each hundred', () => {
		expect(ordinal(111)).toBe('111th');
		expect(ordinal(112)).toBe('112th');
		// 101 is past the teens, so the normal rule resumes.
		expect(ordinal(101)).toBe('101st');
		expect(ordinal(121)).toBe('121st');
	});

	it('returns empty for positions below first', () => {
		expect(ordinal(0)).toBe('');
		expect(ordinal(-3)).toBe('');
	});
});
