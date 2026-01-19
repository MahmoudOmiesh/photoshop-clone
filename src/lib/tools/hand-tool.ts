import { HandIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolOption } from './types';
import type { EditorServices } from '$lib/editor/services';

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

	onPointerDown(services: EditorServices, pointer: PointerState) {
		this.isDragging = true;
		this.lastPos = { x: pointer.x, y: pointer.y };
		services.actions.setOverrideCursor('grabbing');
	}

	onPointerMove(services: EditorServices, pointer: PointerState) {
		if (!this.isDragging) return;

		const deltaX = pointer.x - this.lastPos.x;
		const deltaY = pointer.y - this.lastPos.y;

		services.actions.pan({ x: deltaX, y: deltaY });
		services.actions.requestRender();

		this.lastPos = { x: pointer.x, y: pointer.y };
	}

	onPointerUp(services: EditorServices) {
		this.isDragging = false;
		services.actions.clearOverrideCursor();
	}
}
