<script lang="ts">
	// The left nav: a narrow rail of icons that widens on hover to show the
	// titles, with the current game marked.
	//
	// Two layouts from one markup. Wide enough, and it is a rail beside the
	// page that the top bar's button collapses away entirely. Narrow, and
	// it is an overlay over the page, already expanded -- there is no hover
	// on a touch screen, so a rail of unlabelled icons would be a guess.

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { sidebar } from '$lib/sidebar.svelte';
	import { placeholdersByCategory, type PlaceholderGame } from '$lib/placeholder-games';
	import { ALL_GAMES_ICON, categoryIcon } from './nav-icons';

	const groups = placeholdersByCategory();

	/** The slug of the game being viewed, or null anywhere else. */
	const currentSlug = $derived(page.url.pathname.match(/^\/games\/([^/]+)/)?.[1] ?? null);

	const onHome = $derived(page.url.pathname === resolve('/'));

	// Playable games get a link; the rest get inert text. Linking a
	// placeholder would send the visitor to a 404, which is a worse answer
	// than saying plainly that it is not ready.
	function isPlayable(game: PlaceholderGame): boolean {
		return page.data.playableSlugs?.includes(game.slug) ?? false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			sidebar.closeOverlay();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Rendered whether or not it is showing, and hidden with CSS, so that
     collapsing it is a transform rather than tearing the nav out of the
     DOM and rebuilding it. `inert` keeps the hidden nav out of the tab
     order, which visibility alone would not do.

     :focus-within alongside :hover in the CSS is what keeps the rail
     usable from a keyboard: tabbing into it expands it exactly as a
     pointer does, so a keyboard visitor is never reading bare icons. -->
<nav
	id="site-nav"
	class="sidebar"
	class:hidden={sidebar.hidden}
	class:overlay-open={sidebar.overlayOpen}
	aria-label="Games"
	inert={!sidebar.visible || undefined}
>
	<ul class="group">
		<li>
			<a
				class="item home"
				href={resolve('/')}
				title="All games"
				aria-current={onHome ? 'page' : undefined}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d={ALL_GAMES_ICON} />
				</svg>
				<span class="label">All games</span>
			</a>
		</li>
	</ul>

	{#each groups as group (group.category)}
		<!-- A heading plus a list, rather than a styled div of links, so a
		     screen reader can say how many games are in each section (#26).
		     Collapsed, the heading has nowhere to go: a rail 4.5rem wide
		     cannot hold "Mathematics", so it is hidden from sight and left
		     in the accessibility tree, where it still does its job. -->
		<h2>{group.category}</h2>
		<ul class="group">
			{#each group.games as game (game.id)}
				{@const icon = categoryIcon(game.category)}
				<li>
					{#if isPlayable(game)}
						<!-- A native title on the row, so a pointer resting on a
						     collapsed icon gets the name without waiting for the
						     panel to widen. It does not affect the accessible
						     name, which the label already supplies. -->
						<a
							class="item"
							href={resolve('/games/[slug]', { slug: game.slug })}
							title={game.title}
							aria-current={game.slug === currentSlug ? 'page' : undefined}
							onclick={() => sidebar.closeOverlay()}
						>
							<!-- Decorative: the label beside it already names the
							     row, and an SVG <title> here would put the game's
							     name into the link's accessible name twice. -->
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d={icon} />
							</svg>
							<span class="label">{game.title}</span>
						</a>
					{:else}
						<span class="item soon" title="{game.title} - coming soon">
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d={icon} />
							</svg>
							<span class="label">{game.title}</span>
							<em>Soon</em>
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/each}
</nav>

<!-- Only ever hit in overlay mode, where CSS gives it a size. A plain
     button rather than a div, so dismissing by pointer is also reachable
     by keyboard; Escape does the same thing. -->
{#if sidebar.overlayOpen}
	<button
		type="button"
		class="backdrop"
		aria-label="Close the games menu"
		onclick={() => sidebar.closeOverlay()}
	></button>
{/if}

<style>
	.sidebar {
		position: fixed;
		top: var(--mw-topbar-height);
		bottom: 0;
		left: 0;
		z-index: 20;
		width: var(--mw-rail-width);
		padding: 0.75rem 0.625rem 2rem;
		/* Hidden rather than auto while collapsed: a scrollbar inside a
		   4.5rem rail would eat most of the room the icons need, and the
		   labels sticking out are what widening is for. */
		overflow: hidden;
		background: var(--mw-surface);
		border-right: 1px solid var(--mw-border);
		transition:
			width 0.18s ease,
			transform 0.18s ease;
	}

	/* The rail widens over the page rather than pushing it: the content
	   reserves --mw-rail-width and never reflows, so hovering the nav does
	   not shuffle the paragraph someone is reading. */
	.sidebar:hover,
	.sidebar:focus-within {
		width: var(--mw-sidebar-width);
		overflow-y: auto;
		box-shadow: 0.25rem 0 1.5rem rgb(15 31 71 / 0.12);
	}

	/* Slid out rather than removed, so the layout's margin transition and
	   this one run together instead of the content jumping first. */
	.sidebar.hidden {
		transform: translateX(-100%);
	}

	@media (prefers-reduced-motion: reduce) {
		.sidebar {
			transition: none;
		}
	}

	h2 {
		margin: 1rem 0 0.25rem;
		padding: 0 0.75rem;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--mw-text-muted);
		/* Clipped rather than display:none, so it stays a heading a screen
		   reader can navigate by while the rail is narrow (#26). */
		overflow: hidden;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.12s ease;
	}

	.sidebar:hover h2,
	.sidebar:focus-within h2 {
		opacity: 1;
	}

	/* A rule while collapsed: the heading is invisible, but the break
	   between one category and the next should still read. */
	.group + h2 {
		position: relative;
	}

	.group + h2::before {
		content: '';
		position: absolute;
		top: -0.5rem;
		left: 0.75rem;
		width: 1.75rem;
		border-top: 1px solid var(--mw-border);
		transition: opacity 0.12s ease;
	}

	.sidebar:hover .group + h2::before,
	.sidebar:focus-within .group + h2::before {
		opacity: 0;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		/* 44px minimum, so these are tappable rather than merely clickable
		   (#21). */
		min-height: 44px;
		padding: 0 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.9375rem;
		text-decoration: none;
		color: var(--mw-text);
		/* The row keeps the expanded width even while the rail is narrow,
		   so the label slides out from under the edge instead of reflowing
		   from wrapped to unwrapped as the panel opens. */
		width: calc(var(--mw-sidebar-width) - 1.25rem);
	}

	.item svg {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		/* Stroked, not filled: one set of paths reads at rail size without
		   a second solid variant per glyph. */
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.home svg {
		/* The grid of squares is a filled glyph; stroking it at this size
		   closes the gaps between the tiles. */
		fill: currentColor;
		stroke: none;
	}

	.label {
		flex: 1;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.12s ease;
	}

	.sidebar:hover .label,
	.sidebar:focus-within .label {
		opacity: 1;
	}

	.home {
		font-weight: 600;
	}

	a.item:hover {
		background: var(--mw-surface-sunken);
	}

	/* aria-current does the styling as well as the announcing, so the two
	   cannot drift apart -- a page cannot look current without being it. */
	a.item[aria-current='page'] {
		background: #eceafd;
		color: var(--mw-navy);
		font-weight: 600;
		box-shadow: inset 3px 0 0 var(--mw-indigo);
	}

	a.item:focus-visible {
		outline: var(--mw-focus);
		outline-offset: -3px;
	}

	.soon {
		color: var(--mw-text-muted);
		cursor: default;
	}

	.soon em {
		flex-shrink: 0;
		padding: 0.125rem 0.375rem;
		border-radius: 999px;
		background: var(--mw-surface-sunken);
		border: 1px solid var(--mw-border);
		font-size: 0.6875rem;
		font-style: normal;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0;
		transition: opacity 0.12s ease;
	}

	.sidebar:hover .soon em,
	.sidebar:focus-within .soon em {
		opacity: 1;
	}

	.backdrop {
		position: fixed;
		inset: var(--mw-topbar-height) 0 0 0;
		z-index: 15;
		border: 0;
		padding: 0;
		background: rgb(15 31 71 / 0.45);
		cursor: pointer;
	}

	/* Overlay mode. The breakpoint matches NARROW in sidebar.svelte.ts;
	   the two have to agree or the button will report the wrong state. */
	@media (max-width: 60rem) {
		.sidebar {
			/* Closed by default here regardless of the persisted preference,
			   which describes the column, not the overlay. */
			transform: translateX(-100%);
			/* Full width from the start. There is no hover on a touch screen,
			   so an icon rail that only labels itself on hover would never
			   label itself at all. */
			width: var(--mw-sidebar-width);
			overflow-y: auto;
			box-shadow: 0 0 2rem rgb(15 31 71 / 0.25);
		}

		.sidebar.overlay-open {
			transform: none;
		}

		.sidebar .label,
		.sidebar h2,
		.sidebar .soon em {
			opacity: 1;
		}

		.group + h2::before {
			opacity: 0;
		}
	}

	/* The backdrop only exists in overlay mode. Wide, it would be a
	   full-page button over the content. */
	@media (min-width: 60.0625rem) {
		.backdrop {
			display: none;
		}
	}
</style>
