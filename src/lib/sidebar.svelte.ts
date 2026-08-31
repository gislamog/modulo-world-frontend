// Whether the left nav is showing.
//
// The toggle lives in the top bar and the thing it toggles is a sibling,
// so the state cannot belong to either component. A module-level rune is
// the smallest thing that works: no context plumbing through the layout,
// and the button and the nav read the same value.

import { browser } from '$app/environment';

const STORAGE_KEY = 'mw:sidebar-hidden';

/**
 * Restores the visitor's last choice.
 *
 * localStorage rather than sessionStorage, because hiding the nav is a
 * lasting preference about how much room the games get, not a per-visit
 * dismissal like the save-progress notice. It does not exist during SSR
 * and throws outright in some privacy modes, so a failed read simply
 * leaves the nav shown.
 */
function readHidden(): boolean {
	if (!browser) return false;

	try {
		return localStorage.getItem(STORAGE_KEY) === '1';
	} catch {
		return false;
	}
}

/**
 * Below this width the sidebar is an overlay rather than a column, so it
 * starts closed and closes again after a navigation. Matches the media
 * query in Sidebar.svelte; the two have to agree.
 */
const NARROW = '(max-width: 60rem)';

function isNarrow(): boolean {
	return browser && window.matchMedia(NARROW).matches;
}

class SidebarState {
	/** Hidden on wide screens. Persisted. */
	#hidden = $state(readHidden());

	/** Open as an overlay on narrow screens. Deliberately not persisted:
	 *  an overlay covering the page on arrival would be a trap. */
	#overlayOpen = $state(false);

	get hidden(): boolean {
		return this.#hidden;
	}

	get overlayOpen(): boolean {
		return this.#overlayOpen;
	}

	/** True when the nav is on screen in either mode. Drives the button
	 *  label and its aria-expanded. */
	get visible(): boolean {
		return isNarrow() ? this.#overlayOpen : !this.#hidden;
	}

	toggle() {
		if (isNarrow()) {
			this.#overlayOpen = !this.#overlayOpen;
			return;
		}

		this.#hidden = !this.#hidden;

		try {
			localStorage.setItem(STORAGE_KEY, this.#hidden ? '1' : '0');
		} catch {
			// The choice still holds for this page; it just will not survive
			// a reload. Not worth telling the visitor about.
		}
	}

	/** Called after a navigation and by the overlay's backdrop and Escape
	 *  key. A no-op in column mode, where the nav is not covering anything. */
	closeOverlay() {
		this.#overlayOpen = false;
	}
}

export const sidebar = new SidebarState();
