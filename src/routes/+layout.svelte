<script lang="ts">
	// The app shell: a fixed top bar, a collapsible left nav, and the route
	// in the remaining space. It lives in the layout so the chrome persists
	// across navigations instead of being rebuilt per page.

	import { afterNavigate } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { sidebar } from '$lib/sidebar.svelte';
	import '$lib/styles/theme.css';

	let { children } = $props();

	// On a narrow screen the nav covers the page, so following a link and
	// being left staring at the menu would be a dead end. Harmless in
	// column mode, where there is no overlay to close.
	afterNavigate(() => sidebar.closeOverlay());
</script>

<svelte:head>
	<!-- The mark alone, not the wordmark: at 16px in a tab strip, "Modulo
	     World" set in text is unreadable. -->
	<link rel="icon" href="/branding/ModuloWorld_Logo4_No_Background_3.png" />
	<link rel="apple-touch-icon" href="/branding/ModuloWorld_Logo4_No_Background_3.png" />
	<meta name="theme-color" content="#152a5e" />
</svelte:head>

<!-- Before the header in the DOM, so it is the first thing a keyboard
     visitor reaches and they can get past the whole nav in one key (#26). -->
<a class="skip" href="#main">Skip to content</a>

<TopNav />
<Sidebar />

<!-- The margin, not the sidebar, is what makes room: the nav is fixed, so
     the content has to be told to keep clear of it. -->
<div class="content" class:full={sidebar.hidden} id="main">
	{@render children()}
</div>

<style>
	.content {
		/* The rail width, not the expanded one. Hovering the nav widens it
		   over the page, so the content keeps its position instead of
		   sliding sideways under the pointer. */
		margin-left: var(--mw-rail-width);
		padding-top: var(--mw-topbar-height);
		min-height: 100vh;
		background: var(--mw-surface-sunken);
		transition: margin-left 0.18s ease;
	}

	.content.full {
		margin-left: 0;
	}

	.skip {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 40;
		padding: 0.75rem 1rem;
		background: var(--mw-surface);
		color: var(--mw-link);
		font-family: var(--mw-font);
		/* Off screen until focused, rather than display:none, which would
		   take it out of the tab order and defeat the point. */
		transform: translateY(-150%);
	}

	.skip:focus {
		transform: none;
	}

	/* In overlay mode the nav sits on top of the page rather than beside
	   it, so the content never reserves a column for it. */
	@media (max-width: 60rem) {
		.content {
			margin-left: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.content {
			transition: none;
		}
	}
</style>
