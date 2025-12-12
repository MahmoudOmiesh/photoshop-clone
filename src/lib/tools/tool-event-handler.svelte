<script lang="ts">
	import type { Renderer } from '$lib/canvas/renderer';
	import type { Snippet } from 'svelte';
	import { createToolContext, getCurrentTool } from './tool-store.svelte';
	import type { PointerState } from './types';
	import { assert } from '$lib/utils';

	interface Props {
		renderer: Renderer | null;
		children: Snippet;
	}

	const { renderer, children }: Props = $props();
	const currentTool = $derived(getCurrentTool());
	const cursorStyle = $derived(getCurrentTool().cursor ?? 'default');
	const toolContext = $derived(renderer ? createToolContext(renderer) : null);

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
		currentTool.onPointerDown?.(toolContext, createPointerState(e));
	}

	function onpointermove(e: PointerEvent) {
		assert(toolContext);

		currentTool.onPointerMove?.(toolContext, createPointerState(e));
	}

	function onpointerup(e: PointerEvent) {
		assert(toolContext);

		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		currentTool.onPointerUp?.(toolContext, createPointerState(e));
	}

	function onwheel(e: WheelEvent) {
		assert(toolContext);

		e.preventDefault();
		currentTool?.onWheel?.(
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

		currentTool.onKeyDown?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}

	function onkeyup(e: KeyboardEvent) {
		assert(toolContext);

		currentTool.onKeyUp?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}
</script>

<svelte:window {onkeydown} {onkeyup} />

<div style:cursor={cursorStyle} {onpointerdown} {onpointermove} {onpointerup} {onwheel}>
	{@render children()}
</div>
