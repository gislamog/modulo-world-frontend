// Formatting helpers shared by the games and the leaderboard.

/**
 * Formats a duration in milliseconds as m:ss, or h:mm:ss past an hour.
 *
 * Games report elapsed time in milliseconds and the leaderboard shows it
 * back to the player, so the rounding rule matters: times round down. A
 * run that took 59.9 seconds reads as 0:59, never the 1:00 the player
 * did not achieve.
 */
export function formatDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms < 0) return '0:00';

	const totalSeconds = Math.floor(ms / 1000);
	const seconds = totalSeconds % 60;
	const minutes = Math.floor(totalSeconds / 60) % 60;
	const hours = Math.floor(totalSeconds / 3600);

	const pad = (n: number) => n.toString().padStart(2, '0');

	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Formats a score with thousands separators.
 *
 * Fixed to en-US rather than the visitor's locale. A leaderboard where
 * one row reads 1,000 and the next reads 1.000 is unreadable, and the
 * server renders these too: matching output keeps SSR and the client
 * from disagreeing and triggering a hydration mismatch.
 */
export function formatScore(score: number): string {
	if (!Number.isFinite(score)) return '0';
	return Math.trunc(score).toLocaleString('en-US');
}

/**
 * Ordinal suffix for a leaderboard position: 1st, 2nd, 3rd, 4th.
 *
 * The teens are the trap. 11, 12 and 13 take 'th' despite ending in
 * 1, 2 and 3, and they recur every hundred.
 */
export function ordinal(position: number): string {
	if (!Number.isFinite(position) || position < 1) return '';

	const n = Math.trunc(position);
	const lastTwo = n % 100;

	if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;

	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
}
