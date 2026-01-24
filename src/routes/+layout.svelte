<script lang="ts">
	import '@fontsource-variable/plus-jakarta-sans';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { createEditor } from '$lib/editor/editor.svelte';
	import { MoveTool } from '$lib/tools/move-tool';
	import { HandTool } from '$lib/tools/hand-tool';
	import { ZoomTool } from '$lib/tools/zoom-tool';
	import { CropTool } from '$lib/tools/crop-tool.svelte';
	import { RotateViewTool } from '$lib/tools/rotate-view-tool';

	let { children } = $props();

	createEditor({
		tools: [new HandTool(), new RotateViewTool(), new ZoomTool(), new MoveTool(), new CropTool()]
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen w-screen flex flex-col">
	{@render children()}
</div>
