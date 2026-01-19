<script lang="ts">
	import { Renderer } from '$lib/canvas/renderer';
	import { getEditorContext } from '$lib/editor/context.svelte';
	import EditorEventHandler from '$lib/editor/editor-event-handler.svelte';
	import { onMount } from 'svelte';

	const resizeObserver = (
		node: HTMLElement,
		callback: (entry: ResizeObserverEntry, node: HTMLElement) => void
	) => {
		const ro = new ResizeObserver(([entry]) => callback(entry!, node));
		ro.observe(node);
		return { destroy: () => ro.disconnect() };
	};

	let displayCanvas: HTMLCanvasElement | null = $state(null);
	let overlayCanvas: HTMLCanvasElement | null = $state(null);
	let renderer: Renderer | null = $state(null);

	const ctx = getEditorContext();

	onMount(() => {
		if (!displayCanvas || !overlayCanvas) return;

		renderer = new Renderer(displayCanvas, overlayCanvas, {
			documentStore: ctx.documentStore,
			viewportStore: ctx.viewportStore,
			uiStore: ctx.uiStore
		});

		ctx.setRenderCallback(() => renderer?.requestRerender());
	});

	function handleResize(entry: ResizeObserverEntry) {
		if (!renderer) return;
		const { contentRect } = entry;
		renderer.setDimensions({
			width: Math.floor(contentRect.width),
			height: Math.floor(contentRect.height)
		});
	}
</script>

<div class="flex-1 relative border" use:resizeObserver={handleResize}>
	<EditorEventHandler>
		<canvas bind:this={displayCanvas} class="absolute top-0 left-0"></canvas>
		<canvas bind:this={overlayCanvas} class="absolute top-0 left-0 pointer-events-none"></canvas>
	</EditorEventHandler>
</div>
