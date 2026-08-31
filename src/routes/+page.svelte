<script lang="ts">
	import GameCard from '$lib/components/GameCard.svelte';
	import { PLACEHOLDER_GAMES } from '$lib/placeholder-games';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Real rows win. The placeholders are what the page shows while the
	// registry is still empty, so the layout can be judged against a full
	// grid rather than against one card -- they are not mixed in beside
	// published games, where a visitor could not tell which is which.
	const showingPlaceholders = $derived(data.games.length === 0);
	const games = $derived(showingPlaceholders ? PLACEHOLDER_GAMES : data.games);
</script>

<svelte:head>
	<title>ModuloWorld</title>
	<meta name="description" content="Small games that teach algorithms, mathematics, and music." />
</svelte:head>

<main>
	<header>
		<!-- The mark above the wordmark. Both are decorative here: the h1
		     below carries the name, and alt text on either would repeat it. -->
		<img
			class="mark"
			src="/branding/ModuloWorld_Logo4_No_Background_3.png"
			alt=""
			width="96"
			height="96"
		/>
		<h1>
			<img
				src="/branding/ModuloWorld_Logo4_No_Background_2.png"
				alt="Modulo World"
				width="420"
				height="60"
			/>
		</h1>
		<p class="tagline">Small games that teach algorithms, mathematics, and music.</p>
	</header>

	{#if showingPlaceholders}
		<!-- Said plainly rather than dressed up as a catalogue, so nobody
		     clicks a card expecting a game. -->
		<p class="notice">
			The registry is empty, so these are the games we are building. None of them is playable yet.
		</p>
	{/if}

	<!-- A real list, so a screen reader announces how many games there
	     are before reading them (#26). -->
	<ul class="games">
		{#each games as game (game.id)}
			<li>
				<GameCard {game} unavailable={showingPlaceholders} />
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 60rem;
		/* Space on the sides at every width, so nothing touches the edge of
		   a 360px phone screen (#21). */
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		margin: 0.75rem 0 0;
	}

	img {
		max-width: 100%;
		height: auto;
	}

	.mark {
		width: 5.5rem;
		height: auto;
	}

	h1 img {
		width: min(100%, 26rem);
	}

	.tagline {
		margin: 1rem 0 0;
		font-size: 1.125rem;
		color: var(--mw-text-muted);
	}

	.notice {
		max-width: 34rem;
		margin: 0 auto 2rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--mw-border);
		border-radius: var(--mw-radius);
		background: var(--mw-surface);
		font-size: 0.9375rem;
		line-height: 1.5;
		text-align: center;
		color: var(--mw-text-muted);
	}

	.games {
		display: grid;
		/* auto-fill with a minimum holds the layout from one game to twenty
		   without a breakpoint per count: one card does not stretch across
		   the page, and twenty wrap. min() keeps the track from exceeding
		   the viewport at 360px, which is what would otherwise cause
		   horizontal scrolling (#21). */
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
