// Where server-side rendering sends its API calls (#19).
//
// The .server.ts suffix is load-bearing. $env/dynamic/private may only be
// imported by modules SvelteKit never bundles for the browser, and the
// suffix is how it enforces that. A runtime `if (!browser)` guard is not
// enough: the check is static, so merely importing private env from a
// module the browser can reach fails the build.

import { env } from '$env/dynamic/private';

/** The base URL and the fetch to call it with. */
export interface ApiTarget {
	base: string;
	call: typeof globalThis.fetch;
}

/**
 * The internal target, or null when there is none configured.
 *
 * Null means the caller should keep the relative path and the fetch it was
 * given -- the browser's case, and the local case where the API is on the
 * same origin.
 *
 * When API_INTERNAL_URL is set, server-side rendering calls the API
 * container directly. It cannot use the relative path, which would resolve
 * against the published origin; inside the frontend container that origin
 * is the frontend itself, where nothing serves the API.
 *
 * That call is cross-origin, so it uses the platform fetch rather than
 * SvelteKit's. SvelteKit's applies browser CORS rules and rejects it for
 * want of an Access-Control-Allow-Origin header, and its benefits --
 * cookie forwarding, inlining the response into the page -- only apply
 * same-origin anyway.
 */
export function internalApiTarget(): ApiTarget | null {
	const internal = env.API_INTERNAL_URL;

	if (!internal) {
		return null;
	}

	return { base: `${internal}/api`, call: globalThis.fetch };
}
