import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach, vi } from 'vitest';

// jsdom implements no media queries at all, and the shell asks whether the
// viewport is narrow enough for the sidebar to become an overlay. Reported
// as not matching, so components under test take the wide-screen branch.
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	})
});

// jsdom keeps one document for the whole file, so anything a test renders
// is still in the DOM for the next one. Without this, a getBy* query that
// should match a single element starts finding several.
afterEach(() => {
	cleanup();
	document.body.innerHTML = '';
});
