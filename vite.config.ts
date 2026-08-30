import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-node: the site is self-hosted in a Docker container behind Nginx,
			// not on a managed platform. See the infrastructure repository.
			adapter: adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/lib/**/*.{ts,svelte}'],
			// Barrel file and generated assets: no logic to cover.
			exclude: ['src/lib/index.ts', 'src/lib/assets/**']
			// No thresholds on purpose. A number this early gets satisfied
			// rather than earned. See the note on story #15.
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: './vite.config.ts',
				// Without the browser condition, Svelte resolves to its
				// server build and mount() throws
				// lifecycle_function_unavailable. jsdom alone is not enough:
				// the environment provides a DOM, this decides which build
				// of Svelte is loaded into it.
				resolve: {
					conditions: ['browser']
				},
				test: {
					name: 'client',
					// Components need a DOM. The server project above runs
					// the plain TypeScript, which does not.
					environment: 'jsdom',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			}
		]
	}
});
