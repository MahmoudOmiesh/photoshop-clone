<script lang="ts">
	import { Renderer } from '$lib/canvas/renderer';
	import { getEditorStore } from '$lib/editor/editor-context';
	import EditorEventHandler from '$lib/editor/editor-event-handler.svelte';
	import { assert } from '$lib/utils';
	import { onMount } from 'svelte';

	const ro = (
		node: HTMLElement,
		callback: (entry: ResizeObserverEntry, node: HTMLElement) => void
	) => {
		const ro = new ResizeObserver(([entry]) => callback(entry, node));
		ro.observe(node);
		return {
			destroy: () => ro.disconnect()
		};
	};

	let displayCanvas: HTMLCanvasElement | null = null;
	let overlayCanvas: HTMLCanvasElement | null = null;

	const editorStore = getEditorStore();

	onMount(() => {
		assert(displayCanvas);
		assert(overlayCanvas);

		editorStore.attachRenderer(new Renderer(displayCanvas, overlayCanvas));
	});
</script>

<div
	class="flex-1 relative border"
	use:ro={(entry) => {
		assert(editorStore.renderer);
		const { contentRect } = entry;
		editorStore.renderer.setDimensions({
			width: Math.floor(contentRect.width),
			height: Math.floor(contentRect.height)
		});
	}}
>
	<EditorEventHandler>
		<canvas bind:this={displayCanvas} class="absolute top-0 left-0"></canvas>
		<canvas bind:this={overlayCanvas} class="absolute top-0 left-0 pointer-events-none"></canvas>
	</EditorEventHandler>
</div>
