<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Piano Dash - ModuloWorld</title>
</svelte:head>

<main>
	<nav aria-label="Breadcrumb">
		<a href={resolve('/')}>All games</a>
	</nav>
	<h1>Piano Dash</h1>
</main>

<style>
	main {
		max-width: 60rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	nav {
		margin-bottom: 1.5rem;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: #0b57d0;
		font-size: 0.9375rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1a1a1a;
	}
</style>
