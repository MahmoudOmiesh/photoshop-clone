<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { createEditor } from '$lib/editor/editor.svelte';
	import { MoveTool } from '$lib/tools/move-tool';
	import { HandTool } from '$lib/tools/hand-tool';
	import { ZoomTool } from '$lib/tools/zoom-tool';

	let { children } = $props();

	createEditor({
		tools: [new MoveTool(), new HandTool(), new ZoomTool()]
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen w-screen flex flex-col">
	{@render children()}
</div>
