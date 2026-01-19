<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getEditorContext } from '$lib/editor/context.svelte';
	import type { PointerState } from '$lib/tools/types';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const ctx = getEditorContext();
	const { toolStore, services } = ctx;

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
		toolStore.activeTool.onPointerDown?.(services, createPointerState(e));
	}

	function onpointermove(e: PointerEvent) {
		toolStore.activeTool.onPointerMove?.(services, createPointerState(e));
	}

	function onpointerup(e: PointerEvent) {
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		toolStore.activeTool.onPointerUp?.(services, createPointerState(e));
	}

	function onwheel(e: WheelEvent) {
		e.preventDefault();
		toolStore.activeTool?.onWheel?.(
			services,
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
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				services.actions.undo();
			} else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
				e.preventDefault();
				services.actions.redo();
			}
			return;
		}

		const shortcutTool = toolStore.getToolByShortcut(e.key.toLowerCase());
		if (shortcutTool) {
			toolStore.selectTool(shortcutTool.id, services);
			return;
		}

		toolStore.activeTool.onKeyDown?.(services, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}

	function onkeyup(e: KeyboardEvent) {
		toolStore.activeTool.onKeyUp?.(services, e.key, {
			alt: e.altKey,
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey
		});
	}
</script>

<svelte:window {onkeydown} {onkeyup} />

<div {onpointerdown} {onpointermove} {onpointerup} {onwheel} style:cursor={ctx.uiStore.cursor}>
	{@render children()}
</div>
