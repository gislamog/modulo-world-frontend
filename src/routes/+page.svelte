<svelte:head>
	<title>ModuloWorld</title>
	<meta name="description" content="Small games that teach algorithms, mathematics, and music." />
</svelte:head>

<main>
	<img src="/logo.png" alt="ModuloWorld" width="320" />
	<p class="tagline">Small games that teach algorithms, mathematics, and music.</p>
	<p class="status">Under construction.</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		text-align: center;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	img {
		max-width: 100%;
		height: auto;
	}

	.tagline {
		margin: 1rem 0 0;
		font-size: 1.125rem;
		color: #333;
	}

	.status {
		margin-top: 2rem;
		font-size: 0.875rem;
		color: #777;
	}
</style>
