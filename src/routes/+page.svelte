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
	<link
		rel="preload"
		href="/fonts/fredericka-the-great/FrederickatheGreat-Regular.ttf"
		as="font"
		type="font/ttf"
		crossorigin="anonymous"
	/>
</svelte:head>

<main>
	<header>
		<h1>modulo world</h1>
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

	@font-face {
		font-family: 'Fredericka the Great';
		src: url('/fonts/fredericka-the-great/FrederickatheGreat-Regular.ttf') format('truetype');
		font-weight: 400;
		font-style: normal;
		font-display: swap;
	}

	h1 {
		margin: 0;
		font-family: 'Fredericka the Great', serif;
		font-weight: 400;
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		line-height: 1.15;
		color: #1a1a1a;
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
