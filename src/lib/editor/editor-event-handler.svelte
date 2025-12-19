<script lang="ts">
	import type { Snippet } from 'svelte';
	import { assert } from '$lib/utils';
	import { getEditorStore } from '$lib/editor/editor-context';
	import type { PointerState } from '$lib/tools/types';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		children: Snippet;
		class?: ClassValue;
	}

	const props: Props = $props();
	const editorStore = getEditorStore();

	const toolContext = $derived(
		editorStore ? editorStore.toolStore.createToolContext(editorStore) : null
	);

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
		editorStore.toolStore.activeTool.onPointerDown?.(toolContext, createPointerState(e));
	}

	function onpointermove(e: PointerEvent) {
		assert(toolContext);

		editorStore.toolStore.activeTool.onPointerMove?.(toolContext, createPointerState(e));
	}

	function onpointerup(e: PointerEvent) {
		assert(toolContext);

		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		editorStore.toolStore.activeTool.onPointerUp?.(toolContext, createPointerState(e));
	}

	function onwheel(e: WheelEvent) {
		assert(toolContext);

		e.preventDefault();
		editorStore.toolStore.activeTool?.onWheel?.(
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

		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				editorStore.undo();
			} else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
				e.preventDefault();
				editorStore.redo();
			}

			return;
		}

		const shortcutTool = editorStore.toolStore.getToolByShortcut(e.key.toLowerCase());

		if (shortcutTool) {
			editorStore.toolStore.selectTool(shortcutTool.id);
			return;
		}

		editorStore.toolStore.activeTool.onKeyDown?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}

	function onkeyup(e: KeyboardEvent) {
		assert(toolContext);

		editorStore.toolStore.activeTool.onKeyUp?.(toolContext, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}
</script>

<svelte:window {onkeydown} {onkeyup} />

<div
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onwheel}
	class={props.class}
	style:cursor={editorStore.toolStore.cursorManager.cursor}
>
	{@render props.children()}
</div>
