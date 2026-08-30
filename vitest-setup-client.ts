import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// jsdom keeps one document for the whole file, so anything a test renders
// is still in the DOM for the next one. Without this, a getBy* query that
// should match a single element starts finding several.
afterEach(() => {
	cleanup();
	document.body.innerHTML = '';
});
