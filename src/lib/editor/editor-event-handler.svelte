<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getEditor } from '$lib/editor/editor.svelte';
	import type { PointerState } from '$lib/tools/types';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const editor = getEditor();

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
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		editor.onPointerDown(createPointerState(e));
	}

	function onpointermove(e: PointerEvent) {
		editor.onPointerMove(createPointerState(e));
	}

	function onpointerup(e: PointerEvent) {
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		editor.onPointerUp(createPointerState(e));
	}

	function onwheel(e: WheelEvent) {
		e.preventDefault();
		editor.onWheel(
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
		editor.onKeyDown(e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});

		// Prevent default for undo/redo shortcuts
		if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
			e.preventDefault();
		}
	}

	function onkeyup(e: KeyboardEvent) {
		editor.onKeyUp(e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}
</script>

<svelte:window {onkeydown} {onkeyup} />

<div {onpointerdown} {onpointermove} {onpointerup} {onwheel} style:cursor={editor.ui.cursor}>
	{@render children()}
</div>
