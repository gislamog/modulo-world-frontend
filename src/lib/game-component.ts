// Slug to component, resolved from the filesystem (#19).
//
// The glob is what keeps "a row plus a component" true: a new game is a
// published row and a file in ./games named for its slug. Nothing here
// changes, and neither does the route, the homepage, or the admin.
//
// Eager rather than lazy: a lazy glob hands back a promise, and server
// rendering does not wait for one, so every game would be delivered as a
// loading placeholder and only appear after hydration. Resolved at build
// time, the server renders the real component. Revisit if the registry
// grows large enough for the combined bundle to matter.

import type { Component } from 'svelte';

const modules = import.meta.glob<{ default: Component }>('./games/*.svelte', { eager: true });

function slugOf(path: string): string {
	return path.replace('./games/', '').replace('.svelte', '');
}

/** Slugs that have a component, for tests and diagnostics. */
export function playableSlugs(): string[] {
	return Object.keys(modules).map(slugOf).sort();
}

/**
 * The component for a slug, or null when the game has no implementation
 * yet.
 *
 * A registered game without a component is a normal state, not an error:
 * the row can exist before the game is written, and the route renders a
 * placeholder rather than failing.
 */
export function gameComponent(slug: string): Component | null {
	return modules[`./games/${slug}.svelte`]?.default ?? null;
}
