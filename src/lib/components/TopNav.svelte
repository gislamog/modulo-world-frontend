<script lang="ts">
	// The fixed bar across the top: the sidebar toggle, the wordmark, and
	// the account actions.
	//
	// A <header> with the site heading and the global controls, so a screen
	// reader can jump to it as a landmark rather than tabbing in from the
	// top of the document (#26).

	import { resolve } from '$app/paths';
	import { sidebar } from '$lib/sidebar.svelte';

	// Sign-in belongs to the auth epic and has no route yet, so this is a
	// plain href rather than a resolve() of a typed route -- the same
	// compromise SaveProgressNotice makes.
	const SIGN_IN_HREF = '/login';
</script>

<header class="topbar">
	<!-- aria-expanded rather than a pressed toggle: this controls the
	     visibility of another region, and it names that region with
	     aria-controls so the relationship is announced. -->
	<!-- Icon only. The label moves to aria-label rather than being dropped:
	     an unlabelled icon button is announced as just "button", and the
	     title attribute gives sighted visitors the same words on hover. -->
	<button
		type="button"
		class="toggle"
		aria-expanded={sidebar.visible}
		aria-controls="site-nav"
		aria-label={sidebar.visible ? 'Hide nav bar' : 'Show nav bar'}
		title={sidebar.visible ? 'Hide nav bar' : 'Show nav bar'}
		onclick={() => sidebar.toggle()}
	>
		<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
			<path
				d="M2 4h16M2 10h16M2 16h16"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				fill="none"
			/>
		</svg>
	</button>

	<a class="brand" href={resolve('/')}>
		<!-- The wordmark already reads "Modulo World", so the alt text is the
		     site name and the mark is not announced twice. -->
		<img
			src="/branding/ModuloWorld_Logo4_No_Background_2.png"
			alt="Modulo World"
			width="180"
			height="26"
		/>
	</a>

	<nav class="actions" aria-label="Account">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="sign-in" href={SIGN_IN_HREF}>Sign in</a>
	</nav>
</header>

<style>
	.topbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		/* Above the sidebar, so the sidebar's overlay backdrop on a narrow
		   screen does not cover the button that closes it. */
		z-index: 30;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: var(--mw-topbar-height);
		padding: 0 0.75rem;
		background: linear-gradient(90deg, var(--mw-navy-deep), var(--mw-navy));
		border-bottom: 1px solid rgb(0 0 0 / 0.2);
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Square, and 44px on both axes so it is usable on a phone (#21).
		   The icon is 20px; the rest is touch target. */
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		padding: 0;
		border: 1px solid rgb(255 255 255 / 0.25);
		border-radius: var(--mw-radius);
		background: transparent;
		color: var(--mw-on-navy);
		cursor: pointer;
	}

	.toggle:hover {
		background: rgb(255 255 255 / 0.1);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 0.25rem;
		/* Pushes the account actions to the far end without a spacer div. */
		margin-right: auto;
	}

	.brand img {
		display: block;
		height: 1.625rem;
		width: auto;
	}

	.sign-in {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 1rem;
		border-radius: var(--mw-radius);
		background: var(--mw-indigo);
		color: #fff; /* 5.5:1 on --mw-indigo */
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}

	.sign-in:hover {
		background: var(--mw-violet);
	}

	/* White rather than the blue focus colour: the blue ring is nearly
	   invisible against the navy bar. */
	.toggle:focus-visible,
	.brand:focus-visible,
	.sign-in:focus-visible {
		outline: 3px solid #fff;
		outline-offset: 2px;
	}

	/* The wordmark is the first thing to give up room on a phone: the
	   toggle and the sign-in button are controls, and shrinking a control
	   costs more than shrinking a picture of the name. */
	@media (max-width: 30rem) {
		.brand img {
			height: 1.375rem;
		}

		.sign-in {
			padding: 0 0.75rem;
		}
	}
</style>
