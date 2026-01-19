<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { createEditorContext } from '$lib/editor/context.svelte';

	let { children } = $props();

	createEditorContext();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen w-screen flex flex-col">
	{@render children()}
</div>
