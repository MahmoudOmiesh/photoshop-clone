<script lang="ts">
	import { Renderer } from '$lib/canvas/renderer';
	import ToolEventHandler from '$lib/tools/tool-event-handler.svelte';
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

	let canvasContainer: HTMLDivElement | null = null;

	let displayCanvas: HTMLCanvasElement | null = null;
	let overlayCanvas: HTMLCanvasElement | null = null;

	let renderer: Renderer | null = null;

	onMount(() => {
		assert(displayCanvas);
		assert(overlayCanvas);

		renderer = new Renderer(displayCanvas, overlayCanvas);
	});
</script>

<div
	class="flex-1 relative border"
	bind:this={canvasContainer}
	use:ro={(entry) => {
		assert(renderer);
		const { contentRect } = entry;
		renderer.setDimensions({
			width: Math.floor(contentRect.width),
			height: Math.floor(contentRect.height)
		});
	}}
>
	<ToolEventHandler {renderer}>
		<canvas bind:this={displayCanvas} class="absolute top-0 left-0"></canvas>
		<canvas bind:this={overlayCanvas} class="absolute top-0 left-0 pointer-events-none"></canvas>
	</ToolEventHandler>
</div>
