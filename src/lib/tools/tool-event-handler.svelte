<script lang="ts">
	import { Renderer } from '$lib/canvas/renderer';
	import type { Snippet } from 'svelte';
	import type { PointerState } from './types';
	import { assert } from '$lib/utils';
	import { getToolStore } from './tool-store.svelte';

	interface Props {
		renderer: Renderer | null;
		children: Snippet;
	}

	const { renderer, children }: Props = $props();

	const toolStore = getToolStore();
	const toolContext = $derived(renderer ? toolStore.createToolContext(renderer) : null);

	function createPointerState(e: PointerEvent): PointerState {
		return {
			x: e.offsetX,
			y: e.offsetY,
			pressure: e.pressure,
			button: e.button,
			modifiers: {
				alt: e.altKey,
				shift: e.shiftKey,
				ctrl: e.ctrlKey,
				meta: e.metaKey
			}
		};
	}

	function onpointerdown(e: PointerEvent) {
		assert(toolContext);

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		toolStore.activeTool.onPointerDown?.(toolContext, createPointerState(e));
	}

	function onpointermove(e: PointerEvent) {
		assert(toolContext);

		toolStore.activeTool.onPointerMove?.(toolContext, createPointerState(e));
	}

	function onpointerup(e: PointerEvent) {
		assert(toolContext);

		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		toolStore.activeTool.onPointerUp?.(toolContext, createPointerState(e));
	}

	function onwheel(e: WheelEvent) {
		assert(toolContext);

		e.preventDefault();
		toolStore.activeTool?.onWheel?.(
			toolContext,
			{
				x: e.offsetX,
				y: e.offsetY,
				pressure: 0,
				button: 0,
				modifiers: { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey }
			},
			{ x: e.deltaX, y: e.deltaY }
		);
	}

	function onkeydown(e: KeyboardEvent) {
		assert(toolContext);

		toolStore.activeTool.onKeyDown?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}

	function onkeyup(e: KeyboardEvent) {
		assert(toolContext);

		toolStore.activeTool.onKeyUp?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}
</script>

<svelte:window {onkeydown} {onkeyup} />

<div
	style:cursor={toolStore.cursorManager.cursor}
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onwheel}
>
	{@render children()}
</div>
