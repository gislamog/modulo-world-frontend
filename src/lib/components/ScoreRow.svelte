<script lang="ts">
	import { formatDuration, formatScore, ordinal } from '$lib/format';

	interface Props {
		position: number;
		player: string;
		score: number;
		durationMs: number;
		/** Highlights the visitor's own row in the table. */
		isCurrentPlayer?: boolean;
	}

	let { position, player, score, durationMs, isCurrentPlayer = false }: Props = $props();

	// Guests play without an account (#22), so a missing name is a normal
	// state rather than an error worth rendering blank.
	const displayName = $derived(player.trim() || 'Anonymous');
</script>

<tr class:current={isCurrentPlayer} data-testid="score-row">
	<td class="position">{ordinal(position)}</td>
	<td class="player">
		{displayName}
		{#if isCurrentPlayer}
			<span class="you">you</span>
		{/if}
	</td>
	<td class="score">{formatScore(score)}</td>
	<td class="duration">{formatDuration(durationMs)}</td>
</tr>

<style>
	td {
		padding: 0.5rem 0.75rem;
	}

	.position {
		color: #777;
		font-variant-numeric: tabular-nums;
	}

	/* Tabular figures keep the digits in a column, so scores line up
	   instead of drifting with the width of each numeral. */
	.score,
	.duration {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.current {
		background: #f5f5f5;
		font-weight: 600;
	}

	.you {
		margin-left: 0.4rem;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		background: #333;
		color: #fff;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
	}
</style>
