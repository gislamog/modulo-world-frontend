<script lang="ts">
	import GameCard from '$lib/components/GameCard.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>ModuloWorld</title>
	<meta name="description" content="Small games that teach algorithms, mathematics, and music." />
</svelte:head>

<main>
	<header>
		<img src="/logo.png" alt="ModuloWorld" width="320" />
		<p class="tagline">Small games that teach algorithms, mathematics, and music.</p>
	</header>

	{#if data.games.length > 0}
		<!-- A real list, so a screen reader announces how many games there
		     are before reading them (#26). -->
		<ul class="games">
			{#each data.games as game (game.id)}
				<li>
					<GameCard {game} />
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">No games are published yet. Check back soon.</p>
	{/if}
</main>

<style>
	main {
		max-width: 60rem;
		/* Space on the sides at every width, so nothing touches the edge of
		   a 360px phone screen (#21). */
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	img {
		max-width: 100%;
		height: auto;
	}

	.tagline {
		margin: 1rem 0 0;
		font-size: 1.125rem;
		/* 7.0:1 on white. Passes AA. */
		color: #595959;
	}

	.games {
		display: grid;
		/* auto-fill with a minimum holds the layout from one game to twenty
		   without a breakpoint per count: one card does not stretch across
		   the page, and twenty wrap. min() keeps the track from exceeding
		   the viewport at 360px, which is what would otherwise cause
		   horizontal scrolling (#21). */
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.empty {
		padding: 3rem 1rem;
		text-align: center;
		color: #595959;
	}
</style>
