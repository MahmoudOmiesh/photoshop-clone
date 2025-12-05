<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen w-screen flex flex-col">
	{@render children()}
</div>
