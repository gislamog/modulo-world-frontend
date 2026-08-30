<script lang="ts">
	// Story #22: visible, dismissible, and never in the way. This renders
	// beside the game rather than over it - no modal, no interstitial, and
	// nothing that has to be dismissed before playing.

	import { browser } from '$app/environment';

	// The sign-in route belongs to the auth epic and does not exist yet, so
	// this is a plain href rather than a resolve() of a typed route. The
	// notice ships now because #22 requires the prompt to be present and
	// skippable from the first playable game.
	const SIGN_IN_HREF = '/login';

	const STORAGE_KEY = 'mw:save-progress-notice-dismissed';

	// Session-scoped, so dismissal lasts the visit and the notice returns
	// next time. sessionStorage does not exist during SSR and throws
	// outright in some privacy modes, so the read is guarded and the
	// notice simply shows when it cannot be read.
	function readDismissed(): boolean {
		if (!browser) return false;

		try {
			return sessionStorage.getItem(STORAGE_KEY) === '1';
		} catch {
			return false;
		}
	}

	// Writable derived: it starts from storage and the button assigns over
	// it. A $state seeded by an $effect would render the notice first and
	// hide it a frame later, which flashes for an already-dismissed visitor.
	let dismissed = $derived(readDismissed());

	function dismiss() {
		dismissed = true;

		try {
			sessionStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// Dismissal still holds for this page; it just will not persist
			// across navigations. Not worth surfacing to the visitor.
		}
	}
</script>

{#if !dismissed}
	<aside class="notice">
		<p>Sign in to save your progress.</p>
		<div class="actions">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={SIGN_IN_HREF}>Sign in</a>
			<button type="button" onclick={dismiss}>Dismiss</button>
		</div>
	</aside>
{/if}

<style>
	.notice {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid #d6e2f5;
		border-radius: 0.5rem;
		background: #f2f6fd;
	}

	p {
		margin: 0;
		font-size: 0.9375rem;
		color: #1a1a1a;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	a,
	button {
		/* 44px minimum on both axes, so these are usable on a phone (#21). */
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 0.875rem;
		border-radius: 0.375rem;
		font-size: 0.9375rem;
		font-family: inherit;
		cursor: pointer;
	}

	a {
		background: #0b57d0;
		color: #fff;
		text-decoration: none;
	}

	button {
		border: 1px solid #b8c4d9;
		background: transparent;
		/* 7.0:1 on the panel background. Passes AA. */
		color: #595959;
	}

	a:focus-visible,
	button:focus-visible {
		outline: 3px solid #0b57d0;
		outline-offset: 2px;
	}
</style>
