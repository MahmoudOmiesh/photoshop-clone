import { HandIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolOption } from './types';
import type { Editor } from '$lib/editor/editor.svelte';

export class HandTool extends Tool {
	readonly id = 'hand';
	readonly name = 'Hand';
	readonly icon = HandIcon;
	readonly options: ToolOption[] = [];
	readonly shortcut = 'h';

	private isDragging = false;
	private lastPos = { x: 0, y: 0 };

	getBaseCursor() {
		return 'grab';
	}

	onPointerDown(editor: Editor, pointer: PointerState) {
		this.isDragging = true;
		this.lastPos = { x: pointer.x, y: pointer.y };
		editor.ui.setOverrideCursor('grabbing');
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.isDragging) return;

		const deltaX = pointer.x - this.lastPos.x;
		const deltaY = pointer.y - this.lastPos.y;

		editor.viewport.pan({ x: deltaX, y: deltaY });
		editor.requestRender();

		this.lastPos = { x: pointer.x, y: pointer.y };
	}

	onPointerUp(editor: Editor) {
		this.isDragging = false;
		editor.ui.clearOverrideCursor();
	}
}
