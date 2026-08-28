<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/logo.png" />
</svelte:head>

{@render children()}
