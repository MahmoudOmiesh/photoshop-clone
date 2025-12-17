<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setEditorStore } from '$lib/editor/editor-context';

	let { children } = $props();

	setEditorStore();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen w-screen flex flex-col">
	{@render children()}
</div>
