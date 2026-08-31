<script lang="ts">
	import { resolve } from '$app/paths';
	import SaveProgressNotice from '$lib/components/SaveProgressNotice.svelte';
	import { gameComponent } from '$lib/game-component';
	import { inputWarning } from '$lib/game-types';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const warning = $derived(inputWarning(data.game.inputRequirement));

	// Keyed on the slug so navigating between games swaps the component
	// rather than reusing the previous game's.
	const Game = $derived(gameComponent(data.game.slug));
</script>

<svelte:head>
	<title>{data.game.title} - ModuloWorld</title>
	{#if data.game.description}
		<meta name="description" content={data.game.description} />
	{/if}
</svelte:head>

<main>
	<nav aria-label="Breadcrumb">
		<a href={resolve('/')}>All games</a>
	</nav>

	<h1>{data.game.title}</h1>

	{#if data.game.description}
		<p class="description">{data.game.description}</p>
	{/if}

	<!-- Non-blocking by construction: it sits above the game in the flow
	     and the game renders whether or not it is dismissed (#22). -->
	<SaveProgressNotice />

	{#if warning}
		<!-- role=note rather than alert: it is context, not an interruption,
		     and an alert would preempt whatever a screen reader is
		     currently saying (#21, #26). -->
		<p class="warning" role="note">{warning} to play this game.</p>
	{/if}

	<section class="stage" aria-label="Game">
		<!-- The per-game component, found by slug. A registered game with no
		     component yet keeps the placeholder rather than erroring: the row
		     may exist before the game is written. -->
		{#if Game}
			<Game />
		{:else}
			<p class="placeholder">This game is not playable yet.</p>
		{/if}
	</section>
</main>

<style>
	main {
		max-width: 60rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	nav {
		margin-bottom: 1.5rem;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: #0b57d0;
		font-size: 0.9375rem;
	}

	nav a:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 2px;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1a1a1a;
	}

	.description {
		margin: 0.5rem 0 1.5rem;
		font-size: 1rem;
		line-height: 1.5;
		color: #595959;
	}

	.warning {
		margin: 0 0 1.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #8a4b00;
	}

	.stage {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 20rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		/* The page behind is now the shell's sunken grey, so the stage
		   states its own surface rather than blending into it. */
		background: #fff;
	}

	/* The dashed, hollow look belongs to the empty state, so it applies to
	   the placeholder rather than to the stage that holds a real game. */
	.stage:has(.placeholder) {
		border-style: dashed;
		border-color: #ccc;
	}

	.placeholder {
		margin: 0;
		color: #595959;
	}
</style>
