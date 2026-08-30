import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScoreRow from './ScoreRow.svelte';

// A <tr> outside a table is invalid HTML and jsdom drops it, so each
// render is wrapped in a table body. Without this the row never lands
// in the document and every query fails.
function renderRow(props: {
	position: number;
	player: string;
	score: number;
	durationMs: number;
	isCurrentPlayer?: boolean;
}) {
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	table.append(tbody);
	document.body.append(table);

	return render(ScoreRow, { props, target: tbody });
}

describe('ScoreRow', () => {
	it('renders position, player, score and duration', () => {
		renderRow({ position: 1, player: 'Ada', score: 12500, durationMs: 65_000 });

		const row = screen.getByTestId('score-row');
		expect(row).toBeTruthy();
		expect(row.textContent).toContain('1st');
		expect(row.textContent).toContain('Ada');
		expect(row.textContent).toContain('12,500');
		expect(row.textContent).toContain('1:05');
	});

	it('falls back to Anonymous when the player has no name', () => {
		// Guests can play without an account, so a blank name is expected.
		renderRow({ position: 4, player: '   ', score: 10, durationMs: 1000 });

		expect(screen.getByTestId('score-row').textContent).toContain('Anonymous');
	});

	it('marks the current player and adds the you badge', () => {
		renderRow({
			position: 2,
			player: 'Grace',
			score: 900,
			durationMs: 2000,
			isCurrentPlayer: true
		});

		const row = screen.getByTestId('score-row');
		expect(row.classList.contains('current')).toBe(true);
		expect(row.textContent).toContain('you');
	});

	it('leaves other players unmarked', () => {
		renderRow({ position: 3, player: 'Alan', score: 800, durationMs: 3000 });

		const row = screen.getByTestId('score-row');
		expect(row.classList.contains('current')).toBe(false);
		expect(row.textContent).not.toContain('you');
	});
});
