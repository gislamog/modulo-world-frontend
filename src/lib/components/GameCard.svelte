<script lang="ts">
	import { resolve } from '$app/paths';
	import { inputWarning, type Game } from '$lib/game-types';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	const warning = $derived(inputWarning(game.inputRequirement));
</script>

<!-- An article rather than a div: the homepage is a list of independent
     items, and a screen reader should be able to move between them (#26).
     The whole card is one link, so there is a single tab stop per game
     instead of a title and a thumbnail that both focus. -->
<article class="card" data-testid="game-card">
	<a href={resolve('/games/[slug]', { slug: game.slug })}>
		<h2>{game.title}</h2>
		{#if game.description}
			<p class="description">{game.description}</p>
		{/if}
		{#if warning}
			<!-- Stated before the visitor commits to loading the game (#21). -->
			<p class="warning">{warning}</p>
		{/if}
	</a>
</article>

<style>
	.card {
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		background: #fff;
		transition: border-color 0.15s ease;
	}

	.card:hover {
		border-color: #999;
	}

	a {
		display: block;
		/* The padding belongs to the link, not the card, so the entire
		   surface is clickable and the touch target is the whole card
		   rather than the width of the title text (#21). */
		padding: 1.25rem;
		min-height: 44px;
		color: inherit;
		text-decoration: none;
	}

	/* Never removed, only restyled. A visible focus ring is what makes the
	   grid navigable by keyboard (#26). */
	a:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 2px;
		border-radius: 0.4rem;
	}

	h2 {
		margin: 0;
		font-size: 1.125rem;
		/* 15.3:1 on white. WCAG AA wants 4.5:1 for body text. */
		color: #1a1a1a;
	}

	.description {
		margin: 0.5rem 0 0;
		font-size: 0.9375rem;
		line-height: 1.5;
		/* #595959 is the darkest grey that still passes AA at this size:
		   7.0:1. The #777 used elsewhere is 4.48:1 and fails. */
		color: #595959;
	}

	.warning {
		margin: 0.75rem 0 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #8a4b00;
	}
</style>
