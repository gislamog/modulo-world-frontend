import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TopNav from './TopNav.svelte';
import { sidebar } from '$lib/sidebar.svelte';

describe('TopNav', () => {
	it('shows the wordmark, which names the site', () => {
		render(TopNav);

		const logo = screen.getByAltText('Modulo World');
		expect(logo.getAttribute('src')).toContain('ModuloWorld_Logo4_No_Background_2.png');
	});

	it('sends the wordmark home', () => {
		render(TopNav);

		expect(screen.getByRole('link', { name: 'Modulo World' }).getAttribute('href')).toBe('/');
	});

	it('offers a control that hides the nav bar', () => {
		render(TopNav);

		expect(screen.getByRole('button', { name: /hide nav bar/i })).toBeTruthy();
	});

	it('labels the icon-only toggle without showing text', () => {
		render(TopNav);

		const button = screen.getByRole('button', { name: /nav bar/i });
		// The button is an icon alone, so the name has to come from
		// aria-label -- an unlabelled icon button is announced as just
		// "button" (#26).
		expect(button.getAttribute('aria-label')).toBe('Hide nav bar');
		expect(button.textContent?.trim()).toBe('');
	});

	it('names the region it controls, and reports that region open', () => {
		render(TopNav);

		const button = screen.getByRole('button', { name: /nav bar/i });
		// Without aria-controls the relationship between the button and the
		// nav is visual only, and a screen reader cannot follow it (#26).
		expect(button.getAttribute('aria-controls')).toBe('site-nav');
		expect(button.getAttribute('aria-expanded')).toBe('true');
	});

	it('flips the label and aria-expanded once the nav is hidden', async () => {
		render(TopNav);

		const button = screen.getByRole('button', { name: /hide nav bar/i });
		button.click();
		// The label has to change with the state: a button that still says
		// "Hide" while the nav is hidden describes the wrong action.
		expect(await screen.findByRole('button', { name: /show nav bar/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /nav bar/i }).getAttribute('aria-expanded')).toBe(
			'false'
		);

		// The store is module state shared across tests, so this one puts it
		// back the way it found it.
		sidebar.toggle();
	});
});
