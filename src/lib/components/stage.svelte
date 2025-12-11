<script lang="ts">
	import { Renderer } from '$lib/canvas/renderer';
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

	let isPanning = false;
	let lastMousePos = { x: 0, y: 0 };

	type PEvent = PointerEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};

	function onpointerdown(e: PEvent) {
		isPanning = true;
		lastMousePos = {
			x: e.clientX,
			y: e.clientY
		};
	}

	function onpointermove(e: PEvent) {
		if (!isPanning) return;
		assert(renderer);

		const deltaX = e.clientX - lastMousePos.x;
		const deltaY = e.clientY - lastMousePos.y;

		renderer.getViewport().pan({
			x: deltaX,
			y: deltaY
		});
		renderer.requestRerender();

		lastMousePos = {
			x: e.clientX,
			y: e.clientY
		};
	}

	function onpointerup() {
		isPanning = false;
	}
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
	{onpointerdown}
	{onpointermove}
	{onpointerup}
>
	<canvas bind:this={displayCanvas} class="absolute top-0 left-0"></canvas>
	<canvas bind:this={overlayCanvas} class="absolute top-0 left-0 pointer-events-none"></canvas>
</div>
