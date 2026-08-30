import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SaveProgressNotice from './SaveProgressNotice.svelte';

const STORAGE_KEY = 'mw:save-progress-notice-dismissed';

describe('SaveProgressNotice', () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it('shows the sign-in prompt by default', async () => {
		render(SaveProgressNotice);

		expect(await screen.findByText('Sign in to save your progress.')).toBeTruthy();
	});

	it('offers a sign-in link that does not block play', async () => {
		render(SaveProgressNotice);

		// A link, not a modal or a redirect: story #22 requires the prompt
		// to be skippable.
		const link = await screen.findByRole('link', { name: 'Sign in' });
		expect(link.getAttribute('href')).toBe('/login');
	});

	it('hides after dismissal', async () => {
		const { getByRole } = render(SaveProgressNotice);

		getByRole('button', { name: 'Dismiss' }).click();

		await vi.waitFor(() => {
			expect(screen.queryByText('Sign in to save your progress.')).toBeNull();
		});
	});

	it('records the dismissal for the session', async () => {
		const { getByRole } = render(SaveProgressNotice);

		getByRole('button', { name: 'Dismiss' }).click();

		await vi.waitFor(() => {
			expect(sessionStorage.getItem(STORAGE_KEY)).toBe('1');
		});
	});

	it('stays hidden when the session already dismissed it', async () => {
		sessionStorage.setItem(STORAGE_KEY, '1');

		render(SaveProgressNotice);

		await vi.waitFor(() => {
			expect(screen.queryByText('Sign in to save your progress.')).toBeNull();
		});
	});

	it('still renders when sessionStorage throws', async () => {
		// Some privacy modes throw on access rather than returning null.
		// The notice showing is the safe failure; a crash on a game page
		// would break play, which #22 forbids.
		const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('denied');
		});

		render(SaveProgressNotice);

		expect(await screen.findByText('Sign in to save your progress.')).toBeTruthy();

		getItem.mockRestore();
	});
});
