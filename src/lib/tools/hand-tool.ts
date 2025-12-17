import { HandIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolContext, ToolOption } from './types';
import { assert } from '$lib/utils';

export class HandTool extends Tool {
	id = 'hand-tool';
	name = 'Hand Tool';
	icon = HandIcon;
	options: ToolOption[] = [];
	shortcut = 'h';

	getBaseCursor() {
		return 'grab';
	}

	private isDragging = false;
	private lastPos = { x: 0, y: 0 };

	onPointerDown(ctx: ToolContext, pointer: PointerState) {
		this.isDragging = true;
		this.lastPos = {
			x: pointer.x,
			y: pointer.y
		};

		ctx.cursorManager.setOverride('grabbing');
	}

	onPointerMove(ctx: ToolContext, pointer: PointerState) {
		if (!this.isDragging) return;
		assert(ctx.editorStore.renderer);

		const deltaX = pointer.x - this.lastPos.x;
		const deltaY = pointer.y - this.lastPos.y;

		ctx.editorStore.renderer.getViewport().pan({
			x: deltaX,
			y: deltaY
		});
		ctx.editorStore.renderer.requestRerender();

		this.lastPos = { x: pointer.x, y: pointer.y };
	}

	onPointerUp(ctx: ToolContext) {
		this.isDragging = false;
		ctx.cursorManager.clearOverride();
	}
}
