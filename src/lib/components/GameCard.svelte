<script lang="ts">
	import { resolve } from '$app/paths';
	import { inputWarning, type Game } from '$lib/game-types';
	import { coverHue, gameMedia } from '$lib/game-media';

	interface Props {
		game: Game;
		/** Renders the card without a link, for a game that has no route
		 *  yet. Defaults to false, so a registry row is playable. */
		unavailable?: boolean;
	}

	let { game, unavailable = false }: Props = $props();

	const warning = $derived(inputWarning(game.inputRequirement));
	const media = $derived(gameMedia(game.slug));
	const hue = $derived(coverHue(game.slug));

	// Walks the poster candidates, and past the end of them to the
	// generated cover.
	//
	// Stamped with the slug the failures belong to rather than reset in an
	// $effect: the card is reused when the grid re-renders, and without
	// the comparison a new game would inherit the previous one's failures
	// and skip straight to its fallback. null means nothing has failed
	// yet, which is also the state a different slug lands in.
	let failed = $state<{ slug: string; index: number } | null>(null);

	const posterIndex = $derived(failed?.slug === game.slug ? failed.index : 0);
	const poster = $derived(media.posters[posterIndex] ?? null);

	function posterFailed() {
		failed = { slug: game.slug, index: posterIndex + 1 };
	}

	// The <video> is only rendered once the tile has been pointed at or
	// focused. Mounting eleven of them on load would have the browser
	// opening eleven connections for loops nobody has asked to see; this
	// way the cost is paid per tile, by the visitor who wants it.
	let active = $state(false);
	let videoFailed = $state(false);

	let video = $state<HTMLVideoElement | null>(null);

	// Someone who has asked for less motion gets the still, full stop. The
	// query is read at play time rather than stored, so a change in the OS
	// setting takes effect without a reload.
	function motionAllowed(): boolean {
		return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function enter() {
		if (videoFailed || !motionAllowed()) {
			return;
		}

		active = true;
	}

	function leave() {
		active = false;
	}

	// Autoplay is refused in some configurations even when muted. The
	// rejection is caught rather than left to surface as an unhandled
	// promise: the tile simply keeps showing the poster underneath.
	$effect(() => {
		if (!active || !video) {
			return;
		}

		video.play().catch(() => {
			active = false;
		});
	});
</script>

<!-- An article rather than a div: the homepage is a list of independent
     items, and a screen reader should be able to move between them (#26).
     The whole card is one link, so there is a single tab stop per game
     instead of a title and a thumbnail that both focus. -->
<article class="card" class:unavailable data-testid="game-card">
	<!-- The two branches are written out rather than switched with
	     <svelte:element>: only the link carries the hover handlers, and a
	     conditional handler on a shared element reads to the compiler as a
	     bare div that responds to the mouse. -->
	{#if unavailable}
		<!-- An unbuilt game is a div, not a disabled link: linking it would
		     send the visitor to a 404, and a focusable element that goes
		     nowhere is worse than plain text. -->
		<div>{@render body()}</div>
	{:else}
		<!-- Focus drives the preview alongside hover, so reaching the tile
		     by keyboard shows what reaching it by mouse does (#26). -->
		<a
			href={resolve('/games/[slug]', { slug: game.slug })}
			onmouseenter={enter}
			onmouseleave={leave}
			onfocusin={enter}
			onfocusout={leave}
		>
			{@render body()}
		</a>
	{/if}
</article>

{#snippet body()}
	<div class="tile" style="--cover-hue: {hue}">
		{#if poster}
			<!-- Decorative: the caption below names the game, and alt text
			     repeating the title would have it announced twice. Keyed on
			     the src so a failed candidate mounts a fresh <img> for the
			     next one; reassigning src alone does not reliably re-fire
			     the load in every browser. -->
			{#key poster}
				<img
					class="poster"
					src={poster}
					alt=""
					loading="lazy"
					decoding="async"
					onerror={posterFailed}
				/>
			{/key}
		{/if}

		{#if active}
			<!-- muted and playsinline are what make autoplay permitted at all;
			     without them iOS opens the video fullscreen. No controls: it
			     is a decorative loop, not something to scrub. It is
			     aria-hidden, so it needs no caption track. -->
			<video
				bind:this={video}
				class="preview"
				muted
				loop
				playsinline
				preload="none"
				aria-hidden="true"
				tabindex="-1"
				onerror={() => {
					videoFailed = true;
					active = false;
				}}
			>
				{#each media.sources as source (source.src)}
					<source src={source.src} type={source.type} />
				{/each}
			</video>
		{/if}

		<!-- Sits over the artwork at the bottom, on a gradient scrim: the
		     poster is an arbitrary image, so the text needs its own
		     contrast rather than trusting whatever is behind it. -->
		<div class="caption">
			<h2>{game.title}</h2>
			{#if unavailable}
				<p class="badge">Coming soon</p>
			{:else if warning}
				<!-- Stated before the visitor commits to loading the game (#21). -->
				<p class="badge warning">{warning}</p>
			{/if}
		</div>
	</div>

	{#if game.description}
		<p class="description">{game.description}</p>
	{/if}
{/snippet}

<style>
	.card {
		height: 100%;
		overflow: hidden;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		background: #fff;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.card:hover {
		border-color: #999;
		box-shadow: 0 0.5rem 1.5rem rgb(15 31 71 / 0.12);
	}

	/* Hollow and dashed, matching the empty stage on the game route, so
	   "not built yet" looks the same wherever it appears. */
	.card.unavailable {
		border-style: dashed;
		background: transparent;
	}

	.card.unavailable:hover {
		border-color: #ddd;
		box-shadow: none;
	}

	/* The anchor for a playable game, the div for an unbuilt one. Both are
	   the card's whole surface, so the touch target is the tile rather
	   than the width of the title text (#21). */
	.card > a,
	.card > div {
		display: block;
		color: inherit;
		text-decoration: none;
	}

	.tile {
		position: relative;
		/* A fixed ratio, so the grid stays level whatever the artwork is
		   and a missing poster leaves a tile rather than a collapsed row. */
		aspect-ratio: 16 / 10;
		overflow: hidden;
		/* The fallback cover: visible wherever the poster is missing or has
		   not loaded yet, and what the caption sits on when there is no
		   art at all. */
		background:
			radial-gradient(circle at 30% 25%, hsl(var(--cover-hue) 70% 62%), transparent 60%),
			linear-gradient(
				140deg,
				hsl(var(--cover-hue) 55% 32%),
				hsl(calc(var(--cover-hue) + 40) 60% 20%)
			);
	}

	.poster,
	.preview {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		/* cover, so artwork of any shape fills the tile instead of
		   letterboxing against the gradient. */
		object-fit: cover;
		display: block;
	}

	.preview {
		/* Over the poster. The still stays underneath rather than being
		   swapped out, so the first frame of the loop has something to
		   arrive over and the tile never flashes empty. */
		z-index: 1;
	}

	.caption {
		position: absolute;
		inset: auto 0 0 0;
		z-index: 2;
		padding: 2.5rem 0.875rem 0.75rem;
		/* The scrim is the contrast guarantee: white text over an unknown
		   image is not readable by luck. */
		background: linear-gradient(to top, rgb(9 16 38 / 0.92), rgb(9 16 38 / 0));
	}

	h2 {
		margin: 0;
		font-size: 1.0625rem;
		line-height: 1.3;
		color: #fff;
		text-shadow: 0 1px 3px rgb(0 0 0 / 0.5);
	}

	.badge {
		display: inline-block;
		margin: 0.375rem 0 0;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.16);
		font-size: 0.75rem;
		font-weight: 500;
		/* 12.9:1 on the scrim behind it. */
		color: #f2f4fb;
	}

	.warning {
		background: rgb(251 191 36 / 0.22);
		color: #ffdf9e;
	}

	.description {
		margin: 0;
		padding: 0.875rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		/* #595959 is the darkest grey that still passes AA at this size:
		   7.0:1. The #777 used elsewhere is 4.48:1 and fails. */
		color: #595959;
	}

	/* Never removed, only restyled. A visible focus ring is what makes the
	   grid navigable by keyboard (#26). */
	a:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 2px;
		border-radius: 0.4rem;
	}
</style>
